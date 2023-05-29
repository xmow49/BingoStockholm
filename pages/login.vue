<template>
  <div>
    <h1>Login</h1>
    <input type="text" placeholder="Username" v-model="username" />
    <input type="password" placeholder="Password" v-model="password" />
    <button @click="login">Login</button>
  </div>
</template>

<script setup>
const username = ref("");
const password = ref("");

async function login() {
  console.log("Login");
  const resDataSuccess = await fetch("/api/login", {
    method: "post",
    credentials: "same-origin",
    body: JSON.stringify({
      username: username.value,
      password: password.value,
    }),
  });
  const resData = await resDataSuccess.json();
  if (resData.success) {
    useCookie("token", {
      maxAge: 60 * 60 * 24 * 7,
    }).value = resData.token;
    useRouter().push("/");
  } else {
    console.log("Error");
  }
}
</script>