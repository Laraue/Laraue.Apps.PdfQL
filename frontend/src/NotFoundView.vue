<script setup lang="ts">
</script>

<template>
  <div class="wrapper">
    <div class="error-code">
      404
    </div>
    <div class="error">
      The page is not found
    </div>
    <div class="return-link">
      <router-link :to="{name: 'Pdfql'}">Return to the service</router-link>
    </div>
  </div>
</template>

<style scoped>
  .wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
  }
  .error-code{
    font-weight: 800;
    font-size: 72px;
  }
  .error {
    font-size: 32px;
  }
  .return-link {
    margin-top: 2vh;
    font-size: 24px;
  }
  .return-link a{
    color: #000;
  }
</style>