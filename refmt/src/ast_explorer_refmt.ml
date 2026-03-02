open Js_of_ocaml
open Ocamlformat_lib

module RE = Reason.Reason_toolchain.RE
module ML = Reason.Reason_toolchain.ML

(* --------------------------------------------------------------------------
   AST to JSON
   -------------------------------------------------------------------------- *)

let rec repr_to_yojson : Ppxlib.Pp_ast.repr -> Yojson.Basic.t = function
  | Unit -> `Null
  | Int i -> `Int i
  | String s -> `String s
  | Special s -> `String s
  | Bool b -> `Bool b
  | Char c -> `String (String.make 1 c)
  | Float f -> `Float f
  | Int32 i32 -> `Int (Int32.to_int i32)
  | Int64 i64 -> `Int (Int64.to_int i64)
  | Nativeint ni -> `Int (Nativeint.to_int ni)
  | Array l -> `List (List.map repr_to_yojson l)
  | Tuple l -> `List (List.map repr_to_yojson l)
  | List l -> `List (List.map repr_to_yojson l)
  | Record fields ->
      `Assoc (List.map (fun (k, v) -> (k, repr_to_yojson v)) fields)
  | Constr (cname, []) -> `String cname
  | Constr (cname, [ x ]) -> `Assoc [ (cname, repr_to_yojson x) ]
  | Constr (cname, l) -> `Assoc [ (cname, `List (List.map repr_to_yojson l)) ]

let structure_to_json_string structure =
  let json_printer fmt value =
    Yojson.Basic.pretty_print fmt (repr_to_yojson value)
  in
  let config =
    Ppxlib.Pp_ast.Config.make ~show_attrs:true ~show_locs:true
      ~printer:json_printer ~loc_mode:`Full ()
  in
  Format.asprintf "%a" (Ppxlib.Pp_ast.structure ~config) structure

(* --------------------------------------------------------------------------
   Error handling (syntax errors -> JS exceptions)
   -------------------------------------------------------------------------- *)

let location_to_js_obj (loc : Astlib.Location.t) =
  let _file, start_line, start_char = Location.get_pos_info loc.loc_start in
  let _, end_line, end_char = Location.get_pos_info loc.loc_end in
  (*
     Normalize error ranges following the approach from BuckleScript:
     https://github.com/BuckleScript/bucklescript/blob/2ad2310f/jscomp/super_errors/super_location.ml#L73
  *)
  let normalizedRange =
    if start_char = -1 || end_char = -1 then None
    else if start_line = end_line && start_char >= end_char then
      let col = start_char + 1 in
      Some ((start_line, col), (end_line, col))
    else Some ((start_line, start_char + 1), (end_line, end_char))
  in
  match normalizedRange with
  | None -> Js.undefined
  | Some ((start_line, start_col), (end_line, end_col)) ->
      let int_to_js i =
        i |> float_of_int |> Js.number_of_float |> Js.Unsafe.inject
      in
      Js.def
        (Js.Unsafe.obj
           [|
             ("startLine", int_to_js start_line);
             ("startLineStartChar", int_to_js start_col);
             ("endLine", int_to_js end_line);
             ("endLineEndChar", int_to_js end_col);
           |])

let throw_js_error ~loc ~message =
  let throw_fn = Js.Unsafe.js_expr "function(a) {throw a}" in
  let js_error =
    Js.Unsafe.obj
      [|
        ("message", Js.Unsafe.inject (Js.string message));
        ("location", Js.Unsafe.inject (location_to_js_obj loc));
      |]
  in
  Js.Unsafe.fun_call throw_fn [| Js.Unsafe.inject js_error |]

(* --------------------------------------------------------------------------
   Parsing
   -------------------------------------------------------------------------- *)

let parse_with parser_fn code =
  try code |> Lexing.from_string |> parser_fn with
  | Syntaxerr.Error err ->
      let Location.{ loc_start; loc_end; loc_ghost } =
        Syntaxerr.location_of_error err
      in
      let loc : Astlib.Location.t = { loc_start; loc_end; loc_ghost } in
      throw_js_error ~loc
        ~message:(Printexc.to_string (Syntaxerr.Error err))
  | Reason.Reason_errors.Reason_error (err, loc) ->
      throw_js_error ~loc
        ~message:
          (Printexc.to_string (Reason.Reason_errors.Reason_error (err, loc)))

let parse parser_fn code =
  let structure, _ = parse_with parser_fn code in
  structure_to_json_string structure

let parseRE code = parse RE.implementation_with_comments code
let parseML code = parse ML.implementation_with_comments code

(* --------------------------------------------------------------------------
   Pretty-printing (Reason / OCaml source output)
   -------------------------------------------------------------------------- *)

let print_with printer_fn structure_and_comments =
  printer_fn Format.str_formatter structure_and_comments;
  Format.flush_str_formatter () |> Js.string

let formatRE code =
  parse_with RE.implementation_with_comments code
  |> print_with RE.print_implementation_with_comments

let format_ml source =
  let conf = Conf.default in
  match
    Translation_unit.parse_and_format Syntax.Use_file conf ~input_name:"_none_"
      ~source
  with
  | Ok formatted -> formatted
  | Error e ->
      let buf = Buffer.create 100 in
      let fmt = Format.formatter_of_buffer buf in
      Translation_unit.Error.print fmt e;
      Format.pp_print_flush fmt ();
      failwith (Buffer.contents buf)

(* --------------------------------------------------------------------------
   JS exports
   -------------------------------------------------------------------------- *)

let () =
  Js.export "parseRE" parseRE;
  Js.export "parseML" parseML;
  Js.export "formatRE" formatRE;
  Js.export "formatML" format_ml
