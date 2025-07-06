<script setup lang="ts">
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import {ref, onMounted, watch} from 'vue'
import pdfql from '@/pdfql'
import {editor} from "monaco-editor/esm/vs/editor/editor.api";
import IStandaloneCodeEditor = editor.IStandaloneCodeEditor;
import {PdfqlError} from "@/components/PdfqlError";
import IModelDeltaDecoration = editor.IModelDeltaDecoration;

monaco.languages.register({ id: 'Pdfql' })
monaco.languages.setMonarchTokensProvider('Pdfql', pdfql)

monaco.editor.defineTheme("PdfqlTheme", {
  base: "vs",
  inherit: false,
  rules: [
    { token: "stage.selectType", foreground: "#35c33b" },
    { token: "stage.name", foreground: "#4049dc" },
    { token: "delimiter.curly", foreground: "#D2D5B4" },
    { token: "delimiter.parenthesis", foreground: "#D2D5B4" },
    { token: "method.name", foreground: "#16f4b0" },
    { token: "token.number", foreground: "#e046f3" },
    { token: "token.identifier", foreground: "#D2D5B4" },
    { token: "token.operator", foreground: "#784b78" },
    { token: "dot", foreground: "#D2D5B4" },
  ],
  colors: {
    "editor.background": "#2D1639",
    "editorLineNumber.foreground": "#e5d2f3",
    "editorLineNumber.activeForeground": "#D2D5B4",
    "editorCursor.foreground": "#ecdfdf",
    "editor.lineHighlightBackground": "#2D1639",
    "editor.selectionBackground": "#471561",
  },
});

monaco.languages.registerCompletionItemProvider("Pdfql", {
  provideCompletionItems: (model, position) => {
    const word = model.getWordUntilPosition(position);

    console.log(word);

    const range = {
      startLineNumber: position.lineNumber,
      endLineNumber: position.lineNumber,
      startColumn: word.startColumn,
      endColumn: word.endColumn,
    };

    const suggestions = [
      {
        label: "select",
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: "select(rows)",
        range: range,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        documentation: "Select Stage",
      }
    ]

    return { suggestions: suggestions };
  }
})

const props = defineProps({
  modelValue: String,
  errors: Array
})

const emit = defineEmits(["update:modelValue", "change"])

const editorRef = ref()
let editor: IStandaloneCodeEditor;

const decorationsIds = ref<string[]>([]);

watch(() => props.errors, (newValue) => {
  const model = editor?.getModel()
  if (!model) return

  const newDecorations = getDecorations(newValue)

  decorationsIds.value = model.deltaDecorations(decorationsIds.value, newDecorations);
})

const getDecorations = (errors: PdfqlError[]) : IModelDeltaDecoration[] => {
  const positions = errors ?? []
  return positions.map(v => {
    return {
      range: new monaco.Range(v.startLineNumber + 1, v.startPosition + 1, v.endLineNumber + 1, v.endPosition + 1),
      options: {
        inlineClassName: "pdfql-error",
      },
    }
  })
}

onMounted(() => {
  editor = monaco.editor.create(editorRef.value, {
    value: props.modelValue,
    language: 'Pdfql',
    theme: 'PdfqlTheme',
    minimap: { enabled: false },
    scrollbar: { vertical: "hidden", horizontal: "hidden", handleMouseWheel: false },
    hideCursorInOverviewRuler: true,
    overviewRulerBorder: false
  })

  editor.onDidChangeModelContent(() => {
    emit("update:modelValue", editor.getValue())
    emit("change")
  })
})
</script>

<template>
  <div id="editor" ref="editorRef"></div>
</template>

<style scoped>
#editor {
  height: 30vh;
  text-align: left;
}
</style>
<style>
.monaco-editor{
  outline:none;
  box-shadow: none;
}
</style>