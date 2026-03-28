import { EditorState, Transaction } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { css, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("skir-code-mirror")
export class CodeMirror extends LitElement {
  static override styles = css`
    :host {
      display: block;
      height: 100%;
      min-height: 0;
    }

    #container {
      height: 100%;
      min-height: 0;
    }

    #container .cm-editor {
      height: 100%;
    }

    #container .cm-scroller {
      height: 100%;
    }

    #container .cm-content {
      min-height: 100%;
    }

    #container .cm-gutters {
      display: none;
    }
  `;

  override render(): TemplateResult {
    return html`<div id="container"></div>`;
  }

  @property({ type: Object })
  initialState: EditorState = EditorState.create({});

  override firstUpdated(): void {
    const container = this.renderRoot.querySelector("#container");

    this.editor = {
      kind: "view",
      value: new EditorView({
        state: this.state,
        dispatchTransactions: (
          transactions: readonly Transaction[],
          view: EditorView,
        ): void => {
          view.update(transactions);
          if (transactions.some((transaction) => transaction.docChanged)) {
            this.dispatchEvent(new CustomEvent("text-modified"));
          }
        },
        parent: container!,
      }),
    };
  }

  get state(): EditorState {
    if (this.editor.kind === "state") {
      return this.editor.value ?? this.initialState;
    } else {
      return this.editor.value.state;
    }
  }

  set state(value: EditorState) {
    if (this.editor.kind === "state") {
      this.editor = {
        kind: "state",
        value: value,
      };
    } else {
      this.editor.value.setState(value);
    }
  }

  get view(): EditorView {
    if (this.editor.kind === "view") {
      return this.editor.value;
    } else {
      throw new Error("Editor view not yet initialized");
    }
  }

  private editor:
    | {
        kind: "view";
        value: EditorView;
      }
    | {
        kind: "state";
        value: EditorState | null;
      } = {
    kind: "state",
    value: null,
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "skir-code-mirror": CodeMirror;
  }
}
