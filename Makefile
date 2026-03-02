DUNE = opam exec -- dune

.PHONY: help
help:
	@echo "";
	@echo "List of available make commands";
	@echo "";
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}';
	@echo "";

.PHONY: create-switch
create-switch: ## Create opam switch
	opam switch create . 5.4.1 --deps-only --with-dev-setup -y

.PHONY: install
install: ## Install all dependencies (opam + yarn)
	$(DUNE) build @install
	opam install ./refmt --deps-only --with-test -y
	yarn install --cwd website

.PHONY: init
init: create-switch install ## Bootstrap the project from scratch

.PHONY: build-refmt
build-refmt: ## Build the refmt JS bundle
	$(DUNE) build --root refmt
	mkdir -p refmt/dist
	cp refmt/_build/default/src/ast_explorer_refmt.bc.js refmt/dist/

.PHONY: dev
dev: build-refmt ## Build refmt then start the dev server
	yarn --cwd website dev

.PHONY: watch-refmt
watch-refmt: ## Rebuild refmt on file changes
	$(DUNE) build --root refmt -w

.PHONY: prod
prod: build-refmt ## Production build (refmt + website)
	yarn --cwd website build

.PHONY: serve
serve: ## Serve the built output
	yarn --cwd website start

.PHONY: clean
clean: ## Clean all build artifacts
	$(DUNE) clean --root refmt
	rm -rf refmt/dist out/*

.PHONY: format
format: ## Auto-format OCaml sources
	DUNE_CONFIG__GLOBAL_LOCK=disabled $(DUNE) build --root refmt @fmt --auto-promote

.PHONY: format-check
format-check: ## Check OCaml formatting
	$(DUNE) build --root refmt @fmt

.PHONY: lint
lint: ## Lint the website JS sources
	yarn --cwd website lint
