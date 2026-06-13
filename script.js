const filterButtons = document.querySelectorAll(".filter");
const projectCards = document.querySelectorAll(".project-card");
const toTopButton = document.querySelector(".to-top");
const MODEL_URL = "assets/tm-my-image-model/model.json";
const METADATA_URL = "assets/tm-my-image-model/metadata.json";

const uploadInput = document.querySelector("#image-upload");
const imagePreview = document.querySelector("#image-preview");
const emptyPreview = document.querySelector("#empty-preview");
const predictionList = document.querySelector("#prediction-list");
const modelStatus = document.querySelector("#model-status");
const webcamToggle = document.querySelector("#webcam-toggle");
const webcamContainer = document.querySelector("#webcam-container");

let model;
let webcam;
let isWebcamRunning = false;

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selected = button.dataset.filter;

    filterButtons.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");

    projectCards.forEach((card) => {
      const shouldShow = selected === "all" || card.dataset.category === selected;
      card.classList.toggle("is-hidden", !shouldShow);
    });
  });
});

toTopButton.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

async function loadImageModel() {
  if (model) {
    return model;
  }

  if (!window.tmImage) {
    modelStatus.textContent = "無法載入 Teachable Machine 程式庫，請確認網路連線。";
    return null;
  }

  modelStatus.textContent = "模型載入中...";
  model = await window.tmImage.load(MODEL_URL, METADATA_URL);
  modelStatus.textContent = `模型已載入：${model.getTotalClasses()} 個類別`;
  renderPredictions(model.getClassLabels().map((className) => ({ className, probability: 0 })));
  return model;
}

function renderPredictions(predictions) {
  predictionList.innerHTML = predictions
    .sort((a, b) => b.probability - a.probability)
    .map((item) => {
      const score = Math.round(item.probability * 100);
      return `
        <div class="prediction-row">
          <div class="prediction-label">
            <span>${item.className}</span>
            <span>${score}%</span>
          </div>
          <div class="prediction-bar" style="--score: ${score}%"><span></span></div>
        </div>
      `;
    })
    .join("");
}

async function predictFromElement(element) {
  const loadedModel = await loadImageModel();
  if (!loadedModel) {
    return;
  }

  const predictions = await loadedModel.predict(element);
  renderPredictions(predictions);
  const topPrediction = predictions.reduce((best, item) =>
    item.probability > best.probability ? item : best
  );
  modelStatus.textContent = `最可能結果：${topPrediction.className}（${Math.round(
    topPrediction.probability * 100
  )}%）`;
}

uploadInput?.addEventListener("change", () => {
  const file = uploadInput.files?.[0];
  if (!file) {
    return;
  }

  stopWebcam();
  const imageURL = URL.createObjectURL(file);
  imagePreview.onload = async () => {
    URL.revokeObjectURL(imageURL);
    await predictFromElement(imagePreview);
  };
  imagePreview.src = imageURL;
  imagePreview.hidden = false;
  emptyPreview.hidden = true;
});

async function startWebcam() {
  const loadedModel = await loadImageModel();
  if (!loadedModel) {
    return;
  }

  webcam = new window.tmImage.Webcam(360, 360, true);
  await webcam.setup();
  await webcam.play();
  webcamContainer.replaceChildren(webcam.canvas);
  imagePreview.hidden = true;
  emptyPreview.hidden = true;
  isWebcamRunning = true;
  webcamToggle.textContent = "停止相機";
  window.requestAnimationFrame(webcamLoop);
}

function stopWebcam() {
  if (!webcam) {
    return;
  }

  webcam.stop();
  webcamContainer.replaceChildren();
  webcam = null;
  isWebcamRunning = false;
  webcamToggle.textContent = "啟動相機";
}

async function webcamLoop() {
  if (!isWebcamRunning || !webcam) {
    return;
  }

  webcam.update();
  await predictFromElement(webcam.canvas);
  window.requestAnimationFrame(webcamLoop);
}

webcamToggle?.addEventListener("click", async () => {
  if (isWebcamRunning) {
    stopWebcam();
    emptyPreview.hidden = !imagePreview.hidden;
    return;
  }

  try {
    await startWebcam();
  } catch (error) {
    modelStatus.textContent = "相機啟動失敗，請確認瀏覽器權限或改用圖片上傳。";
  }
});

loadImageModel().catch(() => {
  modelStatus.textContent = "模型載入失敗，請確認模型檔案已部署到 assets/tm-my-image-model。";
});
