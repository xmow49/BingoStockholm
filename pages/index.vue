<template>
  <div>
    <div class="content" v-if="logged">
      <h1>Bingo</h1>
      <h2>
        Soyer l’équipe avec le plus de lignes complétées à la fin du chrono !
      </h2>
      <div v-if="taskStatusPending || taskPending">
        <h1>Loading</h1>
      </div>
      <div v-else class="content">
        <input
          id="fileUpload"
          type="file"
          hidden
          accept="image/*"
          @change="fileSelected"
        />
        <div class="grid-container">
          <div
            class="case"
            v-for="task in Tasks"
            :key="task"
            @click="uploadImage(task)"
            @pointerdown="down(task)"
            @pointerup="up(task)"
            @touchstart="down(task)"
            @touchend="up(task)"
          >
            <img
              v-if="getTaskStatus(task).photo"
              :src="getTaskStatus(task).photo"
              alt="photo"
              class="task-img"
            />
            <p v-else>{{ task.name }}</p>
          </div>
        </div>
        <div v-if="!timerPending">
          <div v-if="Timer.startTime == 0">
            <button @click="startTimer">Démmarer</button>
          </div>
          <div v-else>
            <div v-if="count != null || count != undefined">
              <p>Tâche terminés: {{ count.myTeam }}</p>
              <p>Équipe adverse: {{ count.allTeam - count.myTeam }}</p>
            </div>
            <h1 class="timer">
              {{ timer }}
            </h1>
            <button @click="stopTimer">STOP</button>
          </div>
        </div>
      </div>
    </div>
    <div v-else></div>
  </div>
</template>


<script setup>
import Compressor from "compressorjs";
const headers = useRequestHeaders(["cookie"]);

const token = useCookie("token");
const user = useCookie("user");
const timer = ref("");

const logged = ref(false);
const { pending: taskPending, data: Tasks } = useLazyFetch("/api/tasks");

const {
  pending: timerPending,
  data: Timer,
  refresh: refreshTimer,
} = useLazyFetch("/api/timer");

const {
  pending: taskStatusPending,
  data: taskStatus,
  refresh: refreshTaskStatus,
} = await useLazyAsyncData("status", () => $fetch("/api/taskStatus"));

onMounted(async () => {
  const resDataSuccess = await fetch("/api/token", {
    credentials: "same-origin",
  })
    .then((res) => res.json())
    .then((res) => {
      console.log(res);
      user.value = res.user;
      if (res.success) {
        console.log("Success");
        logged.value = true;
      } else {
        console.log("Error");
        logged.value = false;
        useRouter().push("/login");
      }
    });
  setInterval(() => {
    timer.value = getTimer();
  }, 1000);
  setInterval(() => {
    refreshCount();
  }, 10000);
  refreshCount();
  if (Tasks.value.length < 25) {
    for (let i = Tasks.value.length; i < 25; i++) {
      Tasks.value.push({ name: "[Insérer un élément du BINGO]" });
    }
  }
});

watch(taskPending, (value) => {
  if (!value) {
    // add empty task to 25
  }
});

const { data: count, refresh: refreshCount } = await useLazyAsyncData(
  "count",
  () => $fetch("/api/count?teamId=" + user.value.teamId)
);

var lastSelectedTask = null;
function uploadImage(task) {
  if (getTaskStatus(task) == "null" || getTaskStatus(task) == undefined) {
    document.getElementById("fileUpload").click();
    lastSelectedTask = task;
  }
}

function fileSelected() {
  //get file blob
  const file = document.getElementById("fileUpload").files[0];
  console.log(file);
  var compresedFile;
  new Compressor(file, {
    quality: 0.5,
    width: 1280,
    height: 720,
    success(result) {
      console.log(result);
      const reader = new FileReader();
      reader.readAsDataURL(result);
      reader.onload = function () {
        const data = reader.result;
        console.log(data);
        lastSelectedTask.photo = data;
        const upload = fetch("/api/taskStatus", {
          method: "post",
          credentials: "same-origin",
          body: JSON.stringify({
            task: lastSelectedTask,
            user: user.value,
          }),
        }).then((res) => {
          console.log(res);
          refreshTaskStatus();
        });
        lastSelectedTask = null;
      };
      reader.onerror = function () {
        console.log(reader.error);
      };
    },
    error(err) {
      console.log(err.message);
      compresedFile = file;
    },
  });
}

function getTaskStatus(task) {
  //find taskstatus from a task
  var result = "null";

  taskStatus.value.forEach((status) => {
    if (status.taskId == task.id) {
      result = status;
      return status;
    }
  });

  return result;
}

function getTimer() {
  var time = Number(Timer.value.startTime);

  //end time + 1h
  var endTime = time + 3600000;
  var now = Date.now();
  var diff = endTime - now;
  var minutes = Math.floor(diff / 60000);
  var seconds = ((diff % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}

function startTimer() {
  if (user.value.name != "dorian") {
    alert("Seul Dorian, étant le maitre du monde peut lancer la partie!");
    return;
  }
  fetch("/api/timer?start", {
    credentials: "same-origin",
  });
  setTimeout(() => {
    refreshTimer();
  }, 1000);
}

function stopTimer() {
  confirm("Êtes-vous sûr de vouloir arrêter le timer?");
  confirm("Êtes-vous vraiment sûr?");
  confirm("Êtes-vous vraiment vraiment sûr?");
  confirm("Êtes-vous vraiment vraiment vraiment sûr?");
  confirm("Êtes-vous vraiment vraiment vraiment vraiment sûr?");
  alert("Ok");
  fetch("/api/timer?stop", {
    credentials: "same-origin",
  });
  setTimeout(() => {
    refreshTimer();
  }, 1000);
}

var startTime = 0;
var state = 0;
var firtTime = true;
function up(task) {
  state = 0;
  firtTime = true;
}

function down(task) {
  state = 1;
  if (firtTime) {
    firtTime = false;
    startTime = Date.now();
  }
  const interval = setInterval(() => {
    if (Date.now() - new Date(startTime) > 1500 && !firtTime) {
      clearInterval(interval);
      firtTime = true;
      confirm(
        "Êtes-vous sûr de vouloir supprimer la validation de cette tâche?"
      );
      fetch(
        "/api/taskStatus?id=" +
          getTaskStatus(task).id +
          "&teamId=" +
          user.value.teamId,
        {
          method: "delete",
          credentials: "same-origin",
        }
      ).then(() => {
        refreshTaskStatus();
      });

      return;
    }
    if (state == 0) {
      clearInterval(interval);
      firtTime = true;
    }
  }, 200);
}
</script>







<style lang="scss">
@import url("https://fonts.googleapis.com/css2?family=Inter&display=swap");
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.case {
  border: 1px solid black;
  background-color: #ffc100;
  //   height: 1vw;
  aspect-ratio: 1/1;
}

.task-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(5, 1fr);
  gap: 0px 0px;
  grid-template-areas:
    ". . . . ."
    ". . . . ."
    ". . . . ."
    ". . . . ."
    ". . . . .";
  width: 80%;
}

body {
  background-color: #0b5189;
}
* {
  font-family: "Inter";
  margin: 0;
  color: #ffffff;
}

input {
  background-color: #ffc100;
  border: none;
  border-radius: 5px;
  padding: 5px;
  font-size: 20px;
  color: #ffffff;
  margin: 10px;
}

button {
  background-color: #ffc100;
  border: none;
  border-radius: 5px;
  padding: 5px;
  font-size: 20px;
  color: #ffffff;
  margin: 10px;
}

h1 {
  color: #ffc100;
  //   -webkit-text-stroke: 0.1px black; /* width and color */
  //   font-weight: bolder;
  font-size: 100px;
  paint-order: stroke fill;
  margin: 10px;
}
h2 {
  color: #ffffff;
  font-size: 20px;
  text-align: center;
  margin: 10px;
}

.timer {
  font-size: 150px;
  margin: 10px;
  color: #ffffff;
}
</style>