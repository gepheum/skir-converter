// TODO: add number of UTF-8 bytes copied

import { json } from "@codemirror/lang-json";
import { EditorState } from "@codemirror/state";
import { tokyoNightDay } from "@uiw/codemirror-theme-tokyo-night-day";
import { basicSetup } from "codemirror";
import { css, html, LitElement, TemplateResult } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { getModuleFromGithubUrl } from "skir/dist/get_dependencies_flow.js";
import { AppState, makeZeroState, updateAppState } from "./app-state";
import "./code-mirror";
import { CodeMirror } from "./code-mirror";
import { recordToTypeDefinition } from "./record-to-type-definition";

@customElement("skir-converter-app")
export class App extends LitElement {
  static override styles = css`
    @import url("https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap");

    :host {
      --bg: #d5d6db;
      --bg-panel: #e9e9ef;
      --bg-panel-2: #e2e3e9;
      --ink: #3760bf;
      --muted: #5a6aa6;
      --line: #b7c5e3;
      --accent: #2e7de9;
      --accent-soft: #d9e8ff;
      --warm: #c64343;
      --warm-soft: #ffe4e4;
      --ok: #587539;

      display: block;
      min-height: 100vh;
      background: radial-gradient(
          circle at 10% -10%,
          #eef4ff 0%,
          transparent 35%
        ),
        radial-gradient(circle at 92% 0%, #d8e6ff 0%, transparent 30%),
        linear-gradient(180deg, #d9dbe2 0%, var(--bg) 100%);
      color: var(--ink);
      font-family: "Space Grotesk", "Avenir Next", sans-serif;
    }

    * {
      box-sizing: border-box;
    }

    .app-shell {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0.6rem 0.8rem;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    .top-row {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.6rem;
    }

    .headline {
      border: 1px solid var(--line);
      border-radius: 12px;
      background: linear-gradient(180deg, #f0f4ff, #e4e9f8);
      padding: 0.95rem 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      box-shadow: 0 10px 28px rgba(55, 96, 191, 0.1);
    }

    .title-wrap {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .headline-link {
      color: inherit;
      text-decoration: none;
    }

    .headline-link:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 4px;
      border-radius: 6px;
    }

    h1 {
      margin: 0;
      font-size: 1.08rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .subtitle {
      margin: 0;
      color: var(--muted);
      font-size: 0.78rem;
      line-height: 1.5;
    }

    .pill {
      border-radius: 999px;
      border: 1px solid #cfb78c;
      background: #fff0cb;
      color: #6b4b13;
      padding: 0.3rem 0.7rem;
      font-size: 0.72rem;
      font-family: "Space Grotesk", "Avenir Next", sans-serif;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      white-space: nowrap;
    }

    .panel {
      border: 1px solid var(--line);
      border-radius: 12px;
      background: var(--bg-panel);
      box-shadow: 0 8px 22px rgba(55, 96, 191, 0.08);
      overflow: hidden;
    }

    .top-panel {
      display: flex;
      flex-direction: column;
      height: 320px;
    }

    .panel-head {
      border-bottom: 1px solid var(--line);
      padding: 0.7rem 0.9rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      background: var(--bg-panel-2);
    }

    .panel-head h2 {
      margin: 0;
      font-size: 0.82rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    .panel-head p {
      margin: 0;
      font-size: 0.76rem;
      color: var(--muted);
      font-family: "Space Grotesk", "Avenir Next", sans-serif;
    }

    .panel-body {
      padding: 0.85rem;
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
    }

    .top-panel .panel-body {
      flex: 1;
      min-height: 0;
    }

    .tab-row {
      display: inline-flex;
      width: fit-content;
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 0.15rem;
      background: #dde4f4;
      gap: 0.2rem;
    }

    .tab-row button {
      border: none;
      border-radius: 6px;
      padding: 0.4rem 0.7rem;
      min-width: 7.5rem;
      cursor: pointer;
      background: transparent;
      color: var(--muted);
      font-family: "Space Grotesk", "Avenir Next", sans-serif;
      font-size: 0.77rem;
      transition: background-color 120ms ease, color 120ms ease,
        box-shadow 120ms ease;
    }

    .tab-row button[aria-selected="true"] {
      background: var(--accent);
      color: #fff;
      box-shadow: 0 0 0 1px rgba(46, 125, 233, 0.25) inset;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 0.36rem;
    }

    .editor-field {
      position: relative;
    }

    .top-panel .editor-field {
      flex: 1;
      min-height: 0;
    }

    .editor-overlay {
      position: absolute;
      inset: 0;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.9rem;
      border: 1px solid rgba(183, 197, 227, 0.92);
      border-radius: 10px;
      background: rgba(248, 250, 255, 0.55);
      color: var(--ink);
      font-family: "Space Grotesk", "Avenir Next", sans-serif;
      font-size: 0.8rem;
      line-height: 1.5;
      text-align: center;
      cursor: text;
      backdrop-filter: blur(2px);
    }

    .editor-overlay span {
      max-width: 22rem;
    }

    .field label {
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--muted);
      font-family: "Space Grotesk", "Avenir Next", sans-serif;
    }

    textarea,
    input,
    select {
      width: 100%;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #f5f8ff;
      color: var(--ink);
      padding: 0.62rem 0.7rem;
      font-size: 0.84rem;
      font-family: "Space Grotesk", "Avenir Next", sans-serif;
      outline: none;
      transition: border-color 120ms ease, box-shadow 120ms ease;
    }

    textarea:focus,
    input:focus,
    select:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(46, 125, 233, 0.18);
    }

    textarea {
      min-height: 188px;
      resize: vertical;
      line-height: 1.55;
    }

    .compact-area textarea,
    .compact-area .skir-view,
    .compact-area skir-code-mirror {
      min-height: 138px;
    }

    .skir-view {
      min-height: 188px;
      border: 1px solid var(--line);
      border-radius: 10px;
      background: linear-gradient(180deg, #fffdf5, #fffaf0);
      padding: 0.8rem;
      display: grid;
      gap: 0.5rem;
      align-content: start;
    }

    .tree-node {
      border: 1px solid #e2d9c5;
      border-radius: 8px;
      background: #fff;
      padding: 0.52rem 0.6rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;
      font-family: "Space Grotesk", "Avenir Next", sans-serif;
      font-size: 0.78rem;
    }

    .node-type {
      color: #6a6e77;
    }

    .hint {
      margin: 0;
      font-size: 0.74rem;
      color: #6a5b3f;
      line-height: 1.5;
    }

    .divider {
      height: 1px;
      width: 100%;
      background: var(--line);
    }

    .result-panel-body {
      border: 1px solid var(--line);
      border-radius: 12px;
      overflow: hidden;
      background: #f5f8ff;
    }

    .result-editors {
      display: block;
    }

    .result-editor {
      display: none;
    }

    .result-editor.active {
      display: block;
    }

    .result-message {
      margin: 0;
      padding: 0.75rem;
      font-family: "Space Grotesk", "Avenir Next", sans-serif;
      font-size: 0.8rem;
      line-height: 1.5;
    }

    .result-message.info {
      color: var(--muted);
      background: #f4f7ff;
    }

    .result-message.error {
      color: #8d2b2b;
      background: #ffeaea;
    }

    .result-controls {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }

    .copy-btn {
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #f0f4ff;
      color: var(--muted);
      font-family: "Space Grotesk", "Avenir Next", sans-serif;
      font-size: 0.72rem;
      padding: 0.3rem 0.65rem;
      cursor: pointer;
      transition: background-color 120ms ease, color 120ms ease,
        border-color 120ms ease;
    }

    .copy-btn:hover {
      background: var(--accent);
      color: #fff;
      border-color: var(--accent);
    }

    .copy-confirmation {
      font-family: "Space Grotesk", "Avenir Next", sans-serif;
      font-size: 0.72rem;
      color: var(--ok);
    }

    .copy-wrap {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .schema-mode-hint {
      margin: 0;
      font-size: 0.74rem;
      color: var(--muted);
      font-family: "Space Grotesk", "Avenir Next", sans-serif;
    }

    .field-label-row {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 0.5rem;
    }

    .field-help-link {
      font-family: "Space Grotesk", "Avenir Next", sans-serif;
      font-size: 0.66rem;
      color: var(--muted);
      text-decoration: underline;
    }

    .github-fields {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
    }

    .github-fetch-btn {
      align-self: flex-start;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #f0f4ff;
      color: var(--ink);
      font-family: "Space Grotesk", "Avenir Next", sans-serif;
      font-size: 0.78rem;
      padding: 0.38rem 0.72rem;
      cursor: pointer;
      transition: background-color 120ms ease, border-color 120ms ease;
    }

    .github-fetch-btn:hover {
      background: var(--accent-soft);
      border-color: var(--accent);
    }

    .github-fetch-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      background: #eef1f8;
      border-color: var(--line);
    }

    .github-fetch-row {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      flex-wrap: wrap;
    }

    .github-fetch-status {
      font-family: "Space Grotesk", "Avenir Next", sans-serif;
      font-size: 0.72rem;
      line-height: 1.4;
    }

    .github-fetch-status.success {
      color: var(--ok);
    }

    .github-fetch-status.error {
      color: var(--warm);
    }

    @media (max-width: 930px) {
      .top-row {
        grid-template-columns: 1fr;
      }

      .headline {
        align-items: flex-start;
        flex-direction: column;
      }
    }
  `;

  @state()
  private resultTab: "dense-json" | "readable-json" | "base16" | "base64" =
    "readable-json";

  @state()
  private copied = false;

  @state()
  private schemaOverlayDismissed = false;

  @state()
  private valueOverlayDismissed = false;

  @state()
  private schemaInputMode: "paste-json" | "github" = "paste-json";

  @state()
  private githubUrl = "";

  @state()
  private githubToken = "";

  override render(): TemplateResult {
    type GithubFetchStatus =
      | { kind: "success"; message: string }
      | { kind: "error"; message: string };

    const githubFetchDisabled = this.githubState.kind === "fetching";
    const githubFetchStatus: GithubFetchStatus | undefined =
      this.githubState.kind === "success"
        ? { kind: "success", message: "Fetched schema from GitHub." }
        : this.githubState.kind === "error"
        ? { kind: "error", message: this.githubState.error }
        : undefined;

    return html`
      <main class="app-shell">
        <header class="headline">
          <div class="title-wrap">
            <a class="headline-link" href="https://build.skir/converter">
              <h1>Skir Format Converter</h1>
            </a>
            <p class="subtitle">
              Convert values across dense JSON, readable JSON, and binary
              formats. All conversion happens locally in your browser.
            </p>
          </div>
        </header>

        <section class="top-row">
          ${this.renderSchemaPanel(githubFetchDisabled, githubFetchStatus)}
          ${this.renderInputPanel()}
        </section>

        ${this.renderResultsPanel()}
      </main>
    `;
  }

  private renderSchemaPanel(
    githubFetchDisabled: boolean,
    githubFetchStatus:
      | { kind: "success"; message: string }
      | { kind: "error"; message: string }
      | undefined,
  ): TemplateResult {
    return html`
      <section class="panel top-panel">
        <div class="panel-head">
          <h2>Schema</h2>
        </div>

        <div class="panel-body compact-area">
          <div class="tab-row" role="tablist" aria-label="Schema input mode">
            <button
              role="tab"
              aria-selected=${this.schemaInputMode === "paste-json"}
              @click=${(): void => {
                this.schemaInputMode = "paste-json";
              }}
            >
              Type Descriptor
            </button>
            <button
              role="tab"
              aria-selected=${this.schemaInputMode === "github"}
              @click=${(): void => {
                this.schemaInputMode = "github";
              }}
            >
              GitHub
            </button>
          </div>

          <div
            class="field editor-field"
            style=${this.schemaInputMode === "paste-json"
              ? "display: flex"
              : "display: none"}
          >
            ${this.schemaOverlayDismissed
              ? ""
              : html`
                  <div
                    class="editor-overlay"
                    @click=${(): void => {
                      this.dismissOverlay("schema");
                    }}
                  >
                    <span>Paste the type descriptor JSON</span>
                  </div>
                `}
            <skir-code-mirror
              id="schema-json"
              fill-height
              .initialState=${this.makeInputSchemaEditorState("")}
              @text-modified=${(): void => this.onSchemaTextModified()}
            ></skir-code-mirror>
          </div>

          <div
            class="github-fields"
            style=${this.schemaInputMode === "github"
              ? "display: flex"
              : "display: none"}
          >
            <div class="field">
              <div class="field-label-row">
                <label for="github-url">GitHub file URL</label>
                <a
                  class="field-help-link"
                  href="https://github.com/gepheum/skir-fantasy-game-example/blob/v1.0.0/skir-src/fantasy_game.skir#L123"
                  target="_blank"
                  rel="noopener noreferrer"
                  >Example</a
                >
              </div>
              <input
                id="github-url"
                type="url"
                .value=${this.githubUrl}
                @input=${(event: Event): void => {
                  this.githubUrl = (event.target as HTMLInputElement).value;
                }}
                placeholder="Link to specific line in .skir file"
              />
            </div>

            <div class="field">
              <label for="github-token">GitHub token (optional, risky)</label>
              <input
                id="github-token"
                type="password"
                .value=${this.githubToken}
                @input=${(event: Event): void => {
                  this.githubToken = (event.target as HTMLInputElement).value;
                }}
              />
            </div>

            <div class="github-fetch-row">
              <button
                class="github-fetch-btn"
                type="button"
                ?disabled=${githubFetchDisabled}
                @click=${this.onGithubFetch}
              >
                Fetch
              </button>
              ${githubFetchStatus
                ? html`
                    <span
                      class="github-fetch-status ${githubFetchStatus.kind}"
                      role=${githubFetchStatus.kind === "error"
                        ? "alert"
                        : "status"}
                    >
                      ${githubFetchStatus.message}
                    </span>
                  `
                : ""}
            </div>
          </div>
        </div>
      </section>
    `;
  }

  private renderInputPanel(): TemplateResult {
    return html`
      <section class="panel top-panel">
        <div class="panel-head">
          <h2>Input</h2>
        </div>

        <div class="panel-body compact-area">
          <div class="field editor-field">
            ${this.valueOverlayDismissed
              ? ""
              : html`
                  <div
                    class="editor-overlay"
                    @click=${(): void => {
                      this.dismissOverlay("value");
                    }}
                  >
                    <span
                      >Paste the value in JSON form (dense or readale) or binary
                      form (base16 or base64)
                    </span>
                  </div>
                `}
            <skir-code-mirror
              id="input-value"
              fill-height
              .initialState=${EditorState.create({
                extensions: [basicSetup, tokyoNightDay, json()],
              })}
              @text-modified=${(): void => this.onValueTextModified()}
            ></skir-code-mirror>
          </div>
        </div>
      </section>
    `;
  }

  private renderResultsPanel(): TemplateResult {
    const result = this.appState.result;

    if (result.kind !== "ok") {
      const infoMessage =
        result.kind === "schema-not-set"
          ? "Schema is not set yet. Paste a schema JSON to compute results."
          : result.kind === "value-not-set"
          ? "Value is not set yet. Paste a value to compute results."
          : undefined;

      const errorMessage =
        result.kind === "schema-error"
          ? result.error
          : result.kind === "value-parse-error"
          ? result.error
          : result.kind === "schema-value-match-error"
          ? result.error
          : undefined;

      return html`
        <section class="panel">
          <div class="panel-head">
            <h2>Result</h2>
          </div>

          <div class="panel-body">
            <div class="result-panel-body">
              ${infoMessage
                ? html`<p class="result-message info">${infoMessage}</p>`
                : ""}
              ${errorMessage
                ? html`<p class="result-message error">${errorMessage}</p>`
                : ""}
            </div>
          </div>
        </section>
      `;
    }

    return html`
      <section class="panel">
        <div class="panel-head">
          <h2>Result Panel</h2>
        </div>

        <div class="panel-body">
          <div class="result-controls">
            <div class="tab-row" role="tablist" aria-label="Result tabs">
              ${this.renderResultTabButton("Readable JSON", "readable-json")}
              ${this.renderResultTabButton("Dense JSON", "dense-json")}
              ${this.renderResultTabButton("Binary (base 16)", "base16")}
              ${this.renderResultTabButton("Binary (base 64)", "base64")}
            </div>
            <div class="copy-wrap">
              ${this.copied
                ? html`<span class="copy-confirmation">Copied!</span>`
                : ""}
              <button
                class="copy-btn"
                @click=${(): void => {
                  navigator.clipboard.writeText(this.getResultText(result));
                  this.copied = true;
                  setTimeout(() => {
                    this.copied = false;
                  }, 2000);
                }}
              >
                Copy
              </button>
            </div>
          </div>

          <div class="result-panel-body">
            <div class="result-editors">
              ${this.renderResultEditor(
                "readable-json",
                "result-readable-json",
                result.readableJsonEditorState,
              )}
              ${this.renderResultEditor(
                "dense-json",
                "result-dense-json",
                result.denseJsonEditorState,
              )}
              ${this.renderResultEditor(
                "base16",
                "result-base16",
                result.base16EditorState,
              )}
              ${this.renderResultEditor(
                "base64",
                "result-base64",
                result.base64EditorState,
              )}
            </div>
          </div>
        </div>
      </section>
    `;
  }

  private renderResultEditor(
    tab: "dense-json" | "readable-json" | "base16" | "base64",
    id: string,
    initialState: EditorState,
  ): TemplateResult {
    return html`
      <div
        class=${this.resultTab === tab
          ? "result-editor active"
          : "result-editor"}
        aria-hidden=${this.resultTab === tab ? "false" : "true"}
      >
        <skir-code-mirror
          id=${id}
          .initialState=${initialState}
        ></skir-code-mirror>
      </div>
    `;
  }

  private renderResultTabButton(
    title: string,
    tab: "dense-json" | "readable-json" | "base16" | "base64",
  ): TemplateResult {
    return html`
      <button
        role="tab"
        aria-selected=${this.resultTab === tab}
        @click=${(): void => {
          this.resultTab = tab;
        }}
      >
        ${title}
      </button>
    `;
  }

  private getResultEditorState(
    tab: "dense-json" | "readable-json" | "base16" | "base64",
    result: Extract<AppState["result"], { kind: "ok" }>,
  ): EditorState {
    if (tab === "dense-json") {
      return result.denseJsonEditorState;
    }
    if (tab === "readable-json") {
      return result.readableJsonEditorState;
    }
    if (tab === "base16") {
      return result.base16EditorState;
    }
    return result.base64EditorState;
  }

  private getResultText(
    result: Extract<AppState["result"], { kind: "ok" }>,
  ): string {
    return this.getResultEditorState(this.resultTab, result).doc.toString();
  }

  updateState(): void {
    const oldState = this.appState;
    let valueText: string;
    if (this.valueTextWasModified) {
      valueText = this.inputValueElement!.state.doc.toString();
      this.valueTextWasModified = false;
    } else {
      valueText = oldState.input.text;
    }
    let schemaText: string;
    if (this.schemaTextWasModified) {
      schemaText = this.inputSchemaElement!.state.doc.toString();
      this.schemaTextWasModified = false;
    } else {
      schemaText = oldState.schema.text;
    }
    const newState = updateAppState(valueText, schemaText, oldState);
    this.appState = newState;
    void this.updateComplete.then(() => {
      this.syncResultEditors(newState);
    });
  }

  private syncResultEditors(state: AppState): void {
    if (state.result.kind !== "ok") {
      return;
    }

    if (this.resultReadableJsonElement) {
      this.resultReadableJsonElement.state =
        state.result.readableJsonEditorState;
    }
    if (this.resultDenseJsonElement) {
      this.resultDenseJsonElement.state = state.result.denseJsonEditorState;
    }
    if (this.resultBase16Element) {
      this.resultBase16Element.state = state.result.base16EditorState;
    }
    if (this.resultBase64Element) {
      this.resultBase64Element.state = state.result.base64EditorState;
    }
  }

  private valueTextWasModified = false;
  private schemaTextWasModified = false;
  private stateUpdateTimeoutHandle: ReturnType<typeof setTimeout> | undefined;

  private onValueTextModified(): void {
    this.valueTextWasModified = true;
    this.scheduleStateUpdate();
  }

  private onSchemaTextModified(): void {
    this.schemaTextWasModified = true;
    this.scheduleStateUpdate();
  }

  private async onGithubFetch(): Promise<void> {
    this.githubState = { kind: "fetching" };
    const githubUrl = this.githubUrlElement!.value;
    const githubToken = this.githubTokenElement!.value;
    const onError = (message: string): void => {
      const newGithubState: GithubState = { kind: "error", error: message };
      this.githubState = newGithubState;
      window.setTimeout(() => {
        if (this.githubState === newGithubState) {
          this.githubState = { kind: "initial" };
        }
      }, 4000);
    };
    try {
      const githubResult = await getModuleFromGithubUrl(githubUrl, githubToken);
      if (githubResult.kind === "success") {
        const schemaText = JSON.stringify(
          recordToTypeDefinition(githubResult.record, githubResult.moduleSet),
          undefined,
          "  ",
        );
        this.inputSchemaElement!.state =
          this.makeInputSchemaEditorState(schemaText);
        this.schemaOverlayDismissed = true;
        this.schemaTextWasModified = true;
        this.updateState();
        const newGithubState: GithubState = { kind: "success" };
        this.githubState = newGithubState;
        window.setTimeout(() => {
          if (this.githubState === newGithubState) {
            this.githubState = { kind: "initial" };
          }
        }, 2000);
      } else {
        onError(githubResult.message);
      }
    } catch (e) {
      if (e instanceof Error) {
        onError(e.message);
      } else {
        onError(String(e));
      }
    }
  }

  private scheduleStateUpdate(): void {
    if (this.stateUpdateTimeoutHandle !== undefined) {
      clearTimeout(this.stateUpdateTimeoutHandle);
    }
    this.stateUpdateTimeoutHandle = setTimeout(() => {
      this.stateUpdateTimeoutHandle = undefined;
      this.updateState();
    }, 100);
  }

  private dismissOverlay(kind: "schema" | "value"): void {
    if (kind === "schema") {
      this.schemaOverlayDismissed = true;
      requestAnimationFrame(() => {
        this.inputSchemaElement?.view.focus();
      });
      return;
    }

    this.valueOverlayDismissed = true;
    requestAnimationFrame(() => {
      this.inputValueElement?.view.focus();
    });
  }

  private makeInputSchemaEditorState(schemaText: string): EditorState {
    return EditorState.create({
      extensions: [basicSetup, tokyoNightDay, json()],
      doc: schemaText,
    });
  }

  @query("#input-value")
  inputValueElement: CodeMirror | undefined;
  @query("#schema-json")
  inputSchemaElement: CodeMirror | undefined;
  @query("#github-url")
  githubUrlElement: HTMLInputElement | undefined;
  @query("#github-token")
  githubTokenElement: HTMLInputElement | undefined;
  @query("#result-readable-json")
  resultReadableJsonElement: CodeMirror | undefined;
  @query("#result-dense-json")
  resultDenseJsonElement: CodeMirror | undefined;
  @query("#result-base16")
  resultBase16Element: CodeMirror | undefined;
  @query("#result-base64")
  resultBase64Element: CodeMirror | undefined;

  @state()
  private appState = makeZeroState();
  @state()
  private githubState: GithubState = { kind: "initial" };
}

if (!customElements.get("skir-converter-app")) {
  customElements.define("skir-converter-app", App);
}

declare global {
  interface HTMLElementTagNameMap {
    "skir-converter-app": App;
  }
}

type GithubState =
  | {
      kind: "initial";
    }
  | {
      kind: "fetching";
    }
  | {
      kind: "success";
    }
  | {
      kind: "error";
      error: string;
    };
