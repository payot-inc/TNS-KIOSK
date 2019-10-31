<template>
  <div id="contents">
    <div class="main">
      <router-link to="/products">
        <div class="logo">
          <span class="logo1">PAYOT</span>
          <span class="logo2">TNS</span>
        </div>
        <div class="title">
          <img src="@/assets/img/title.png" />
          <p class="text1">vending machine system</p>
          <p class="text2">편리한 자동판매기 시스템</p>
        </div>
        <div class="shape_bg">
          <img src="@/assets/img/main-bg.png" />
        </div>
        <div class="bottom">
          <img src="@/assets/img/touch.png" />
          <p>화면을 터치해주세요</p>
        </div>
      </router-link>
    </div>
    <!-- main -->
  </div>
</template>

<script>
export default {
  name: 'home',
};
</script>
