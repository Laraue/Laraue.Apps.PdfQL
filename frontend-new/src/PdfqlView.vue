<script setup lang="ts">
  import {computed, onMounted, ref, watch} from 'vue';
  import axios, {AxiosError} from "axios";
  import { ArrowDown, UploadFilled } from '@element-plus/icons-vue'
  import type {PdfqlError} from "./components/PdfqlError.ts";
  import type {UploadFile, UploadProps} from "element-plus";
  import VueJsonPretty from 'vue-json-pretty';
  import 'vue-json-pretty/lib/styles.css';

  const defaultPsql = `select(tables)`;
  const file = ref<UploadFile | null>(null);
  const pdfql = ref("");
  const isLoading = ref(false);
  const result = ref<PsqlExecutionResult>({ result: null, errors: [] });
  const isSnippetWindowOpened = ref(false);

  interface PsqlExecutionResult {
    result: any;
    errors: PdfqlError[];
  }

  interface CheckQueryResult {
    errors: PdfqlError[];
  }

  const run = async () => {
    try {
      result.value = await runQueryAsync();
    }
    catch (e) {
      result.value.result = null;
      if (e instanceof AxiosError) {
        result.value.errors.push({startPosition: 1, endPosition: 2, startLineNumber: 1, endLineNumber: 1, message: e.message});
      }
      else {
        throw e;
      }
    }
  }

  const checkSyntax = async () => {
    result.value.result = null;
    result.value.errors = (await checkSyntaxAsync()).errors;
  }

  const checkSyntaxAsync = async () : Promise<CheckQueryResult> => {
    const { data } = await axios.post('psql/check-query', {
      pdfql: pdfql.value
    });
    return data;
  }

  const runQueryAsync = async () : Promise<PsqlExecutionResult> => {
    return await withLoader(async() => {
      const { data } = await axios.post('psql/run-query', {
        pdfql: pdfql.value,
        pdfBytes: await getBase64(file.value!),
        extractionAlgorithm: 0
      });
      return data;
    })
  }

  const handleChange: UploadProps['onChange'] = (uploadFile, uploadFiles) => {
    if (uploadFiles.length > 1)
      uploadFiles.shift();
    file.value = uploadFile
  }

  const getBase64 = (file: any) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file.raw);
      reader.onload = () => resolve(reader.result?.slice(28));
      reader.onerror = (error) => reject(error);
    });
  };

  const withLoader = async (func: () => Promise<any>) => {
    try {
      isLoading.value = true;
      return await func();
    } finally {
      isLoading.value = false;
    }
  }

  const modes = [
    {
      title: "Select tables",
      pdfql: "select(tables)",
      id: "tables"
    },
    {
      title: "Select table rows",
      pdfql: "select(tableRows)",
      id: "tableRows"
    },
    {
      title: "Select table cells",
      pdfql: "select(tableCells)",
      id: "tableCells"
    },
    {
      title: "Write query manually (advanced)",
      pdfql: "",
      id: "manual"
    },
  ]

  const snippets = [
    {
      title: "Select 3 first tables",
      pdfql: "select(tables)\r->take(3)",
    },
    {
      title: "Select table rows where first cell equals 'Customer'",
      pdfql: "select(tableRows)\r->filter(row => row.GetCell(1).Text() == 'Customer')"
    },
  ]

  const chooseSnippet = (value: string) => {
    pdfql.value = value;
    isSnippetWindowOpened.value = false;
  }

  const chooseSuggestion = (id: string) => {
    currentModeId.value = id;
    pdfql.value = currentMode.value!.pdfql;
  }

  const currentModeId = ref<string | null>(null);
  const currentMode = computed(() => {
    return currentModeId.value ? modes.find(m => m.id === currentModeId.value)! : null;
  })

  watch(pdfql, () => {
    checkSyntax();
  })

  onMounted(() => {
    pdfql.value = defaultPsql;
  })
</script>

<template>
  <div class="body">
    <el-dialog v-model="isSnippetWindowOpened" title="Select a snippet" width="800">
      <div v-for="snippet in snippets">
        <a href="#" @click.prevent="chooseSnippet(snippet.pdfql)">{{ snippet.title }}</a>
      </div>
    </el-dialog>
    <div class="layout">
      <div class="content">
        <div class="title">
          <div class="title-text">
            <h1>Extract objects from PDF</h1>
          </div>
          <div class="title-description">
            The service helps to extract PDF parts in the popular formats for free. Registration is not required.
          </div>
        </div>
        <div class="snippet-selection-frame">
          <div class="snippet-selection-dropdown">
            <el-dropdown>
              <el-button>
                {{ currentMode ? currentMode.title : 'I want to' }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-for="mode in modes" @click="chooseSuggestion(mode.id)">{{ mode.title }}</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
        <div class="select-pdf-frame" v-if="currentMode">
          <el-upload
              class="pdf-uploader"
              :on-change="handleChange"
              :auto-upload="false"
              accept="application/pdf"
              drag
              :limit="2">
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              Drop PDF here to process or <em>click to upload</em>
            </div>
          </el-upload>
        </div>
        <div class="editor-frame" v-if="currentMode?.id === 'manual'">
          <div class="editor-frame-left">
            <div class="editor-code-frame">
              <PdfqlEditor
                  v-model="pdfql"
                  :errors="result.errors"/>
            </div>
            <div class="editor-frame-bottom">
              Enter PDF query or
              <a href="" @click.prevent="isSnippetWindowOpened = true">choose</a>
              a snippet.
              Full <a target="_blank" href="https://github.com/win7user10/Laraue.PdfQL">Documentation</a> is available on github.
            </div>
          </div>
        </div>
        <div class="run-execution-frame">
          <el-button v-if="pdfql.length > 0 && file"
                     :loading="isLoading"
                     class="execute-pdfql-button"
                     @click="run">
            {{ isLoading ? 'Processing' : 'Start' }}
          </el-button>
        </div>
        <div class="execution-result-frame" v-if="result.errors.length > 0 || result.result">
          <div class="execution-result">
            <div v-for="error in result.errors" class="execution-result__item">
              <p class="execution-result__error-line">
                {{error.startLineNumber}}:{{error.startPosition}}
              </p>
              <p class="execution-result__error-description">
                {{error.message}}
              </p>
            </div>
            <div>
              <div v-if="result.result" class="execution-result__result">
                <vue-json-pretty
                  :data="result.result"
                  :deep="2"
                  :collapsed-node-length="20" />
              </div>
            </div>
          </div>
          <div class="execution-result__stat">
            <div class="execution-result__title">
              Output Window
            </div>
            <div class="execution-result__current-state">
              {{ result.errors.length > 0 ? result.errors.length + ' error(s) found' : '' }}
            </div>
          </div>
        </div>
      </div>
      <div class="footer">
        <div class="footer-steps">
          <div class="footer-step">
            <div class="footer-step__title">Step 1</div>
            <div class="footer-step__name">Enter the PDF query</div>
            <div class="footer-step__description">
              You can write you own query or choose the snippet from the list. The app checks syntax and show errors if the occurred
            </div>
          </div>
          <div class="footer-step">
            <div class="footer-step__title">Step 2</div>
            <div class="footer-step__name">Upload PDF document</div>
            <div class="footer-step__description">
              Files are uploaded using safe connection. The app doesn't store them after processing.
            </div>
          </div>
          <div class="footer-step">
            <div class="footer-step__title">Step 3</div>
            <div class="footer-step__name">Launch and get a result</div>
            <div class="footer-step__description">
              The result can be returned in json / XML / docx / xlsx /csv formats.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.body{
  color: #fff;
  display: flex;
  justify-content: center;
}
.layout{
  width: 100vw;
  max-width: 1920px;
  background: rgb(26, 4, 37);
  display: flex;
  justify-content: center;
  flex-flow: column;
  align-items: center;
}
.content{
  margin-top: 5vh;
  max-width: 960px;
  text-align: center;
}
.title-text h1{
  font-size: 36px;
  font-weight: 600;
}
.title-description{
  font-size: 20px;
  font-weight: 400;
  margin-top: 15px;
}
a{
  text-decoration: underline;
  color: #848826FF;
}
a:hover{
  color: rgb(201, 205, 116);
}
a:focus{
  color: #e2e3c2;
}
.pdf-uploader{
  padding: 2vw 0;
  width: 15vw;
}
.select-pdf-frame{
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.editor-code-frame{
  max-width: 871px;
}
.editor-frame{
  max-width: 960px;
  background: #2D1639;
  display: flex;
  justify-content: space-between;
  margin-top: 2vh;
}
.editor-frame-left{
  width: 100%;
}
.editor-frame-bottom{
  padding-left: 1vh;
  padding-bottom: 1vh;
  text-align: left;
}
.execute-pdfql-button{
  margin-top: 5vh;
  background: #672E85;
  color: #fff;
  border: none;
  font-size: 16px;
  font-weight: 500;
  width: 200px;
  height: 40px;
}
.execute-pdfql-button:hover{
  background: #8650a3;
  cursor: pointer;
  color: #fff;
}
.execute-pdfql-button.is-disabled{
  background: #2D1639;
  color: #fff;
}
.execute-pdfql-button.is-disabled:hover{
  background: #2D1639;
  color: #fff;
}
.execution-result-frame{
  margin-top: 5vh;
  display: flex;
  flex-flow: column;
  background: #5C3C6C;
  border: 1px solid var(--el-border-color);
  min-height: 15vh;
  justify-content: space-between;
  padding-left: 0.5vw;
  padding-right: 0.5vw;
  margin-bottom: 5vw;
}
.execution-result__item{
  display: flex;
  line-height: 0;
  font-size: 14px;
  height: 16px;
}
.execution-result__error-line{
  margin-right: 0.5vw;
  font-weight: 500;
  width: 30px;
  text-align: left;
}
.execution-result__error-description{
  font-weight: 200;
}
.execution-result__stat{
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 300;
  margin-top: 2vh;
}
.execution-result__result{
  text-align: left;
}
.footer{
  background: #E0E0E0;
  color: #000000;
  width: 100%;
}
.footer-steps{
  display: flex;
  justify-content: space-around;
  gap: 30px;
  margin: 10vh 1vw;
}
.footer-step{
  width: 14vw;
  background: #fff;
  text-align: left;
  padding: 2vh 2vw;
}
.footer-step__title{
  text-transform: uppercase;
  font-weight: 300;
  font-size: 10px;
}
.footer-step__name{
  margin-top: 3vh;
  font-weight: 400;
  font-size: 16px;
}
.footer-step__description{
  margin-top: 5vh;
  font-size: 14px;
}
.snippet-selection-frame{
  display: flex;
  justify-content: center;
  align-items: flex-end;
  font-size: 18px;
  margin-top: 5vh;
}
.snippet-selection-dropdown .el-button{
  background: rgb(26, 4, 37);
  color: #646547;
  border: none;
  text-decoration: underline;
}
.run-execution-frame{
  margin-bottom: 5vh;
}
</style>
<style>
.el-upload-list__item:hover{
  background-color: #2D1639 !important;
}
.el-upload-dragger .el-upload__text em{
  color: #aaaa36;
}
.vjs-tree-node.is-highlight, .vjs-tree-node:hover {
  background-color: #57127a;
}
</style>

