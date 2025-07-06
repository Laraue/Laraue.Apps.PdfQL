<template>
  <div class="body">
    <div class="layout">
      <div class="content">
        <div class="title">
          <div class="title-text">
            Extract tables from PDF
          </div>
          <div class="title-description">
            The service with it's own language helps you extract data in any format you want. Free and powerful with API's and more more features.
          </div>
          <div class="title-documentation-link">
            <a target="_blank" href="https://github.com/win7user10/Laraue.PdfQL">Documentation</a>
          </div>
        </div>
        <div class="editor-frame">
          <div class="editor-frame-left">
            <div class="editor-code-frame">
              <PdfqlEditor
                  v-model="pdfql"
                  @change="checkSyntax"
                  :errors="result.errors"/>
            </div>
            <div class="editor-frame-bottom">
              Enter PDF query or
              <a href="">choose</a>
              a snippet.
            </div>
          </div>
          <div class="editor-frame-right">
            <el-upload
                class="pdf-uploader"
                action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15">
              <el-icon class="pdf-uploader-icon">
                <Plus/>
              </el-icon>
            </el-upload>
            Upload PDF
          </div>
        </div>
        <div>
          <button
            class="execute-pdfql-button">
            Execute PDF query
          </button>
        </div>
        <div class="execution-result-frame">
          <div class="execution-result">
           <div v-for="error in result.errors" class="execution-result__item">
             <p class="execution-result__error-line">
               {{error.startLineNumber}}:{{error.startPosition}}
             </p>
             <p class="execution-result__error-description">
               {{error.message}}
             </p>
           </div>
         </div>
          <div class="execution-result__stat">
            <div class="execution-result__title">
              Output Window
            </div>
            <div class="execution-result__current-state">
              2 errors found
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

<script lang="ts">
import {defineComponent, ref} from 'vue';
import axios from "axios";
import PdfqlEditor from "@/components/PdfqlEditor.vue";
import {PdfqlError} from "@/components/PdfqlError";
import { Plus } from '@element-plus/icons-vue'

export default defineComponent({
  name: 'HomeView',
  components: {
    PdfqlEditor,
    Plus
  },
  setup(){
    const defaultPsql = `select(tables)
->selectMany(tableCells)
->map((item) => item.GetCell(2))
->map((item) => item.Text())`;

    const files = ref<File[]>([]);
    const pdfql = ref(defaultPsql);
    const isLoading = ref(false);
    const result = ref<PsqlExecutionResult>({ result: null, errors: [] });

    interface PsqlExecutionResult {
      result: any;
      errors: PdfqlError[];
    }

    interface CheckQueryResult {
      errors: PdfqlError[];
    }

    const run = async () => {
      result.value = await runQueryAsync();
    }

    const checkSyntax = async () => {
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
          pdfBytes: await getBase64(files.value[0]!)
        });
        return data;
      })
    }

    const getBase64 = (file: any) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result?.slice(28));
        reader.onerror = (error) => reject(error);
      });
    };

    const withLoader = async (func: () => Promise<any>) => {
      try {
        return await func();
      } finally {
        isLoading.value = false;
      }
    }

    return {
      files,
      pdfql,
      run,
      result,
      checkSyntax,
    }
  }
});
</script>

<style scoped>
  .body{
    color: #fff;
    font-family: Inter,serif;
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
  }
  .title-text{
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
    color: rgb(132, 136, 38);
  }
  a:hover{
    color: rgb(201, 205, 116);
  }
  .title-documentation-link{
    margin-top: 20px;
    margin-bottom: 60px;
  }
  .pdf-uploader{
    color: #1c5bba;
    overflow: hidden;
    cursor: pointer;
    position: relative;
    border: 1px dashed var(--el-border-color);
    border-radius: 6px;
    width: 5vw;
    height: 5vw;
    margin-left: 1vw;
    margin-right: 1vw;
    display: flex;
    justify-content: center;
  }
  .pdf-uploader-icon{
    color: #8c939d;
  }
  .editor-frame-right{
    display: flex;
    justify-content: center;
    flex-direction: column;
    background: #2D1639;
  }
  .editor-code-frame{
    max-width: 871px;
  }
  .editor-frame{
    max-width: 960px;
    background: #2D1639;
    display: flex;
    justify-content: space-between;
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
</style>
