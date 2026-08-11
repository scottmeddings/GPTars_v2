import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

// Standalone STL viewer. Built to public/viewer.js by `npm run build:viewer`
// and loaded as a plain script, so it survives the scriptless GitHub Pages
// export the same way static/theme.js does.

function isDark() {
  // Dark is the site default; only an explicit light choice opts out.
  return document.documentElement.dataset.theme !== "light";
}

function fail(container, message) {
  const note = document.createElement("p");
  note.className = "viewer-fallback";
  note.textContent = message;
  container.appendChild(note);
  container.classList.add("is-ready");
}

function init(container) {
  // Guard against a second boot, e.g. if the bundle is included twice.
  if (container.dataset.viewerReady) return;
  container.dataset.viewerReady = "1";

  let models;
  try {
    models = JSON.parse(container.dataset.models || "[]");
  } catch {
    models = [];
  }
  if (!models.length) {
    fail(container, "No model files were listed for this viewer.");
    return;
  }

  const stage = document.createElement("div");
  stage.className = "viewer-stage";
  container.appendChild(stage);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch {
    stage.remove();
    fail(container, "This browser cannot display WebGL content. The STL files below open in any CAD or mesh viewer.");
    return;
  }

  const width = () => stage.clientWidth || 800;
  const height = () => stage.clientHeight || 600;

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width(), height());
  stage.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, width() / height(), 1, 20000);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;

  scene.add(new THREE.HemisphereLight(0xffffff, 0x40484f, 2.1));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(1200, 1800, 1400);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xffffff, 0.8);
  fill.position.set(-1400, 600, -900);
  scene.add(fill);

  const grid = new THREE.GridHelper(2400, 24);
  grid.material.transparent = true;
  grid.material.opacity = 0.28;
  scene.add(grid);

  const groups = new Map();
  const bounds = new THREE.Box3();
  let loaded = 0;

  function applyTheme() {
    const dark = isDark();
    renderer.setClearColor(dark ? 0x0c1114 : 0xedf1f3, 1);
    grid.material.color.set(dark ? 0x2b363d : 0xc6d0d6);
  }
  applyTheme();
  new MutationObserver(applyTheme).observe(document.documentElement, {
    attributeFilter: ["data-theme"],
  });

  function frameCamera() {
    if (bounds.isEmpty()) return;
    const size = bounds.getSize(new THREE.Vector3());
    const centre = bounds.getCenter(new THREE.Vector3());
    const radius = Math.max(size.x, size.y, size.z);
    const distance = radius / (2 * Math.tan((camera.fov * Math.PI) / 360));

    controls.target.copy(centre);
    camera.position.set(centre.x + distance * 0.75, centre.y + distance * 0.35, centre.z + distance * 1.05);
    camera.near = radius / 100;
    camera.far = radius * 40;
    camera.updateProjectionMatrix();
    controls.update();
  }

  const loader = new STLLoader();
  models.forEach((model) => {
    loader.load(
      model.url,
      (geometry) => {
        geometry.computeVertexNormals();
        const mesh = new THREE.Mesh(
          geometry,
          new THREE.MeshStandardMaterial({
            color: new THREE.Color(model.color),
            metalness: 0.55,
            roughness: 0.42,
            transparent: !!model.opacity,
            opacity: model.opacity ?? 1,
          }),
        );
        // The STL is exported in the design's own frame, which is already
        // Y-up with the ground plane at Y=0, matching three.js. No rotation.
        scene.add(mesh);
        groups.set(model.name, mesh);
        if (model.hidden) mesh.visible = false;

        bounds.expandByObject(mesh);
        loaded += 1;
        if (loaded === models.length) {
          frameCamera();
          container.classList.add("is-ready");
        }
      },
      undefined,
      () => {
        loaded += 1;
        if (loaded === models.length) frameCamera();
      },
    );
  });

  // Per-group visibility toggles
  const buttons = new Map();
  const legend = document.createElement("div");
  legend.className = "viewer-legend";
  models.forEach((model) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "viewer-toggle";
    if (model.hidden) button.classList.add("is-off");
    button.innerHTML = `<i style="background:${model.color}"></i>${model.label}`;
    button.addEventListener("click", () => {
      const mesh = groups.get(model.name);
      if (!mesh) return;
      mesh.visible = !mesh.visible;
      button.classList.toggle("is-off", !mesh.visible);
    });
    buttons.set(model.name, button);
    legend.appendChild(button);
  });

  const reset = document.createElement("button");
  reset.type = "button";
  reset.className = "viewer-toggle viewer-reset";
  reset.textContent = "Reset view";
  reset.addEventListener("click", frameCamera);
  legend.appendChild(reset);

  /** Show exactly the named groups; hide everything else. */
  function showOnly(predicate) {
    models.forEach((model) => {
      const mesh = groups.get(model.name);
      if (!mesh) return;
      const visible = predicate(model);
      mesh.visible = visible;
      const button = buttons.get(model.name);
      if (button) button.classList.toggle("is-off", !visible);
    });
  }

  // Presets. "Skins off" is the one that matters: it strips the cosmetic
  // bodywork so the subframe, drive and equipment are all visible at once.
  const presets = document.createElement("div");
  presets.className = "viewer-presets";
  [
    ["Everything", () => true],
    ["Skins off", (m) => m.group !== "skin"],
    ["Subframe only", (m) => m.group === "structure"],
    ["Structure + drive", (m) => m.group === "structure" || m.group === "drive"],
    ["Equipment", (m) => m.group === "equipment" || m.group === "structure"],
  ].forEach(([label, predicate], index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "viewer-preset";
    if (index === 0) button.classList.add("is-active");
    button.textContent = label;
    button.addEventListener("click", () => {
      showOnly(predicate);
      presets.querySelectorAll(".viewer-preset").forEach((b) => b.classList.remove("is-active"));
      button.classList.add("is-active");
    });
    presets.appendChild(button);
  });

  container.appendChild(presets);
  container.appendChild(legend);

  new ResizeObserver(() => {
    camera.aspect = width() / height();
    camera.updateProjectionMatrix();
    renderer.setSize(width(), height());
  }).observe(stage);

  renderer.setAnimationLoop(() => {
    controls.update();
    renderer.render(scene, camera);
  });
}

function boot() {
  document.querySelectorAll("[data-stl-viewer]").forEach((container) => {
    try {
      init(container);
    } catch (error) {
      // A viewer failure must never take the rest of the page down.
      console.error("[gptars] STL viewer failed", error);
      fail(container, "The interactive model could not be loaded. The STL files below open in any CAD or mesh viewer.");
    }
  });
}

// Wait for load rather than DOMContentLoaded so React has finished hydrating
// before the viewer touches the DOM.
if (document.readyState === "complete") {
  boot();
} else {
  window.addEventListener("load", boot);
}
