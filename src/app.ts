// TODO: add number of UTF-8 bytes copied

import { json } from "@codemirror/lang-json";
import { EditorState } from "@codemirror/state";
import { tokyoNightDay } from "@uiw/codemirror-theme-tokyo-night-day";
import { basicSetup as codemirrorBasicSetup } from "codemirror";
import { css, html, LitElement, TemplateResult } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { AppState, makeZeroState, updateAppState } from "./app-state";
import "./code-mirror";
import { CodeMirror } from "./code-mirror";

const basicSetup = () => codemirrorBasicSetup;
const tokyoNightDayTheme = () => tokyoNightDay;

@customElement("skir-converter-app")
export class App extends LitElement {
  static override styles = css`
    @import url("https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap");

    :host {
      --bg: #d5d6db;
      --panel: #e9e9ef;
      --ink: #3760bf;
      --muted: #6172b0;
      --line: #b7c5e3;
      --accent: #2e7de9;
      --accent-soft: #dbe8ff;
      --warm: #c64343;
      --warm-soft: #f7d7d7;
      --ok: #587539;

      display: block;
      min-height: 100vh;
      background: radial-gradient(
          circle at top right,
          #c4d5ff 0%,
          transparent 38%
        ),
        radial-gradient(circle at bottom left, #d3f0e7 0%, transparent 44%),
        var(--bg);
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
      border-radius: 14px;
      background: linear-gradient(120deg, #f4f6ff, #e8ecf9);
      padding: 0.95rem 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    .title-wrap {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    h1 {
      margin: 0;
      font-size: 1.18rem;
      letter-spacing: 0.01em;
    }

    .subtitle {
      margin: 0;
      color: var(--muted);
      font-size: 0.86rem;
    }

    .pill {
      border-radius: 999px;
      border: 1px solid #cfb78c;
      background: #fff0cb;
      color: #6b4b13;
      padding: 0.3rem 0.7rem;
      font-size: 0.72rem;
      font-family: "IBM Plex Mono", monospace;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      white-space: nowrap;
    }

    .panel {
      border: 1px solid var(--line);
      border-radius: 14px;
      background: var(--panel);
      box-shadow: 0 8px 24px rgba(55, 96, 191, 0.08);
      overflow: hidden;
    }

    .panel-head {
      border-bottom: 1px solid var(--line);
      padding: 0.7rem 0.9rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      background: #e4e9f6;
    }

    .panel-head h2 {
      margin: 0;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.09em;
    }

    .panel-head p {
      margin: 0;
      font-size: 0.76rem;
      color: var(--muted);
      font-family: "IBM Plex Mono", monospace;
    }

    .panel-body {
      padding: 0.85rem;
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
    }

    .tab-row {
      display: inline-flex;
      width: fit-content;
      border: 1px solid var(--line);
      border-radius: 10px;
      padding: 0.2rem;
      background: #dde6fa;
      gap: 0.2rem;
    }

    .tab-row button {
      border: none;
      border-radius: 8px;
      padding: 0.4rem 0.7rem;
      min-width: 7.5rem;
      cursor: pointer;
      background: transparent;
      color: var(--muted);
      font-family: "IBM Plex Mono", monospace;
      font-size: 0.77rem;
      transition: background-color 120ms ease, color 120ms ease;
    }

    .tab-row button[aria-selected="true"] {
      background: var(--accent);
      color: #fff;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 0.36rem;
    }

    .field label {
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--muted);
      font-family: "IBM Plex Mono", monospace;
    }

    textarea,
    input,
    select {
      width: 100%;
      border: 1px solid var(--line);
      border-radius: 10px;
      background: #f8faff;
      color: var(--ink);
      padding: 0.62rem 0.7rem;
      font-size: 0.9rem;
      font-family: "IBM Plex Mono", monospace;
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

    .compact-area skir-code-mirror {
      height: 80px;
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
      font-family: "IBM Plex Mono", monospace;
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

    .result-body {
      flex: 1;
      margin: 0;
      padding: 0.65rem;
      font-family: "IBM Plex Mono", monospace;
      font-size: 0.78rem;
      color: #5a689d;
      background: repeating-linear-gradient(
        180deg,
        #f8faff,
        #f8faff 26px,
        #f3f6ff 26px,
        #f3f6ff 52px
      );
      overflow: auto;
      line-height: 1.5;
    }

    .result-panel-body {
      border: 1px solid var(--line);
      border-radius: 12px;
      overflow: hidden;
      background: #f8faff;
      min-height: 210px;
      display: flex;
      flex-direction: column;
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
      font-family: "IBM Plex Mono", monospace;
      font-size: 0.72rem;
      padding: 0.3rem 0.65rem;
      cursor: pointer;
      transition: background-color 120ms ease, color 120ms ease;
    }

    .copy-btn:hover {
      background: var(--accent);
      color: #fff;
      border-color: var(--accent);
    }

    .copy-confirmation {
      font-family: "IBM Plex Mono", monospace;
      font-size: 0.72rem;
      color: var(--ok);
    }

    .copy-wrap {
      display: flex;
      align-items: center;
      gap: 0.5rem;
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

  override render(): TemplateResult {
    return html`
      <main class="app-shell">
        <header class="headline">
          <div class="title-wrap">
            <h1>Skir Converter Workbench</h1>
          </div>
        </header>

        <section class="top-row">
          ${this.renderInputPanel()} ${this.renderSchemaPanel()}
        </section>

        ${this.renderResultsPanel()}
      </main>
    `;
  }

  private renderSchemaPanel(): TemplateResult {
    return html`
      <section class="panel">
        <div class="panel-head">
          <h2>Schema Panel</h2>
        </div>

        <div class="panel-body compact-area">
          <div class="field">
            <skir-code-mirror
              id="schema-json"
              .initialState=${EditorState.create({
                extensions: [basicSetup(), tokyoNightDayTheme(), json()],
              })}
              @text-modified=${(): void => this.onSchemaTextModified()}
            ></skir-code-mirror>
          </div>

          <div class="divider"></div>

          <div class="field">
            <label for="github-url">GitHub URL (optional)</label>
            <input id="github-url" type="url" />
          </div>
        </div>
      </section>
    `;
  }

  private renderInputPanel(): TemplateResult {
    return html`
      <section class="panel">
        <div class="panel-head">
          <h2>Input + Conversion Panel</h2>
        </div>

        <div class="panel-body compact-area">
          <div class="field">
            <skir-code-mirror
              id="input-value"
              .initialState=${EditorState.create({
                extensions: [basicSetup(), tokyoNightDayTheme()],
              })}
              @text-modified=${(): void => this.onValueTextModified()}
            ></skir-code-mirror>
          </div>

          <div class="field">
            <label for="input-format">Input format</label>
            <select
              id="input-format"
              .value=${this.appState.input.format}
              @change=${(): void => this.updateState()}
            >
              <option value="auto">Auto</option>
              <option value="json">JSON</option>
              <option value="base16">Binary (base 16)</option>
              <option value="base64">Binary (base 64)</option>
            </select>
          </div>
        </div>
      </section>
    `;
  }

  private renderResultsPanel(): TemplateResult {
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
                  navigator.clipboard.writeText(
                    this.getResultPreview(this.resultTab),
                  );
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
            <pre class="result-body">
${this.getResultPreview(this.resultTab)}</pre
            >
          </div>
        </div>
      </section>
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

  private getResultPreview(
    tab: "dense-json" | "readable-json" | "base16" | "base64",
  ): string {
    if (tab === "dense-json") {
      return '{"message":"hello","bytes":[72,101,108,108,111]}';
    }
    if (tab === "readable-json") {
      return '{\n  "message": "hello",\n  "bytes": [72, 101, 108, 108, 111]\n}';
    }
    if (tab === "base16") {
      return "48656c6c6f";
    }
    return "SGVsbG8=";
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
    const inputFormat = this.inputKindElement!
      .value as AppState["input"]["format"];
    let schemaText: string;
    if (this.schemaTextWasModified) {
      schemaText = this.inputSchemaElement!.state.doc.toString();
      this.schemaTextWasModified = false;
    } else {
      schemaText = oldState.schema.text;
    }
    const newState = updateAppState(
      valueText,
      inputFormat,
      schemaText,
      oldState,
    );
    this.appState = newState;
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

  private scheduleStateUpdate(): void {
    if (this.stateUpdateTimeoutHandle !== undefined) {
      clearTimeout(this.stateUpdateTimeoutHandle);
    }
    this.stateUpdateTimeoutHandle = setTimeout(() => {
      this.stateUpdateTimeoutHandle = undefined;
      this.updateState();
    }, 100);
  }

  @query("#input-format")
  inputKindElement: HTMLSelectElement | undefined;
  @query("#input-value")
  inputValueElement: CodeMirror | undefined;
  @query("#schema-json")
  inputSchemaElement: CodeMirror | undefined;

  @state()
  private appState = makeZeroState();
}

if (!customElements.get("skir-converter-app")) {
  customElements.define("skir-converter-app", App);
}

declare global {
  interface HTMLElementTagNameMap {
    "skir-converter-app": App;
  }
}
