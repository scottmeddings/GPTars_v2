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

  // ---- decals ---------------------------------------------------------
  // Printed vinyl, so they live on the bodywork and must disappear with it.
  // STL carries no UVs or materials, so each decal is a textured plane sitting
  // 0.5 mm proud of the panel it is applied to, positioned in the same
  // millimetres as the decal schedule.
  let decals = [];
  try {
    decals = JSON.parse(container.dataset.decals || "[]");
  } catch {
    decals = [];
  }

  const ORANGE = "#d97b19";
  const YELLOW = "#f2c200";
  const INK = "#141414";

  function texture(w, h, draw) {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    draw(canvas.getContext("2d"), w, h);
    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return tex;
  }

  function hazardTexture(repeats) {
    const tex = texture(64, 64, (g) => {
      g.fillStyle = YELLOW;
      g.fillRect(0, 0, 64, 64);
      g.strokeStyle = INK;
      g.lineWidth = 22;
      for (let i = -64; i < 128; i += 44) {
        g.beginPath();
        g.moveTo(i, -10);
        g.lineTo(i + 74, 74);
        g.stroke();
      }
    });
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, repeats);
    return tex;
  }

  function triangleTexture(kind) {
    return texture(220, 200, (g, w, h) => {
      g.clearRect(0, 0, w, h);
      g.beginPath();
      g.moveTo(w / 2, 6);
      g.lineTo(w - 6, h - 8);
      g.lineTo(6, h - 8);
      g.closePath();
      g.fillStyle = YELLOW;
      g.fill();
      g.strokeStyle = INK;
      g.lineWidth = 9;
      g.stroke();
      g.fillStyle = INK;
      if (kind === "crush") {
        g.fillRect(w / 2 - 30, h / 2 - 22, 60, 17);
        g.fillRect(w / 2 - 30, h / 2 + 28, 60, 17);
      } else {
        g.fillRect(w / 2 - 34, h / 2 + 4, 30, 58);
        g.fillRect(w / 2 + 4, h / 2 + 4, 30, 58);
        g.fillRect(w / 2 - 42, h / 2 - 12, 84, 11);
      }
    });
  }

  const DECAL_ART = {
    hazard: (d) => hazardTexture(Math.max(1, Math.round(d.h / d.w))),
    crush: () => triangleTexture("crush"),
    starts: () => triangleTexture("starts"),
    wordmark: () =>
      texture(208, 1000, (g, w, h) => {
        g.clearRect(0, 0, w, h);
        g.save();
        g.translate(w / 2, h / 2);
        g.rotate(-Math.PI / 2);
        g.fillStyle = ORANGE;
        g.font = "700 150px ui-monospace, Menlo, monospace";
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.fillText("TARS", 0, 0);
        g.restore();
      }),
    dots: () =>
      texture(144, 800, (g, w, h) => {
        g.clearRect(0, 0, w, h);
        g.fillStyle = ORANGE;
        const rows = ["111", "101", "111", "010", "111", "011", "110", "111", "101", "111", "010"];
        rows.forEach((bits, r) => {
          bits.split("").forEach((bit, c) => {
            if (bit !== "1") return;
            g.beginPath();
            g.arc(28 + c * 44, h - 40 - r * ((h - 80) / (rows.length - 1)), 13, 0, Math.PI * 2);
            g.fill();
          });
        });
      }),
    index: (d) =>
      texture(128, 128, (g, w, h) => {
        g.fillStyle = "rgba(154,167,176,0.85)";
        g.fillRect(0, 0, w, h);
        g.fillStyle = "#12171c";
        g.font = "700 54px ui-monospace, Menlo, monospace";
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.fillText(d.label || "P", w / 2, h / 2 + 2);
      }),
    plate: (d) =>
      texture(480, 208, (g, w, h) => {
        g.fillStyle = "#12171c";
        g.fillRect(0, 0, w, h);
        g.strokeStyle = "#2c353c";
        g.lineWidth = 4;
        g.strokeRect(2, 2, w - 4, h - 4);
        g.fillStyle = "#cfd6da";
        g.font = "700 34px ui-monospace, Menlo, monospace";
        g.fillText("GP-TARS V2 1000", 24, 52);
        g.strokeStyle = ORANGE;
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(24, 68);
        g.lineTo(w - 24, 68);
        g.stroke();
        g.font = "26px ui-monospace, Menlo, monospace";
        (d.lines || []).forEach((line, i) => {
          g.fillStyle = "#8b98a2";
          g.fillText(line[0], 24, 112 + i * 40);
          g.fillStyle = "#cfd6da";
          g.fillText(line[1], 200, 112 + i * 40);
        });
      }),
  };

  const decalGroup = new THREE.Group();
  scene.add(decalGroup);
  decals.forEach((d) => {
    const art = DECAL_ART[d.kind];
    if (!art) return;
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(d.w, d.h),
      new THREE.MeshBasicMaterial({
        map: art(d),
        transparent: true,
        depthWrite: false,
        toneMapped: false,
      }),
    );
    // 0.5 mm proud of the surface, which is about what laminated vinyl stands.
    if (d.face === "starboard") {
      mesh.rotation.y = Math.PI / 2;
      mesh.position.set(d.at + 0.5, d.y, d.x);
    } else if (d.face === "port") {
      mesh.rotation.y = -Math.PI / 2;
      mesh.position.set(d.at - 0.5, d.y, d.x);
    } else {
      mesh.position.set(d.x, d.y, d.at + 0.5);
    }
    mesh.renderOrder = 2;
    decalGroup.add(mesh);
  });

  const loader = new STLLoader();
  const stlCount = models.length;
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
        if (loaded === stlCount) {
          frameCamera();
          container.classList.add("is-ready");
        }
      },
      undefined,
      () => {
        loaded += 1;
        if (loaded === stlCount) frameCamera();
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

  // Decals get their own switch, but they are bodywork: every preset that
  // strips the skins strips them too.
  const decalButton = document.createElement("button");
  decalButton.type = "button";
  decalButton.className = "viewer-toggle";
  decalButton.innerHTML = `<i style="background:${ORANGE}"></i>Decals`;
  function setDecals(visible) {
    decalGroup.visible = visible;
    decalButton.classList.toggle("is-off", !visible);
  }
  decalButton.addEventListener("click", () => setDecals(!decalGroup.visible));
  if (decals.length) legend.appendChild(decalButton);

  const reset = document.createElement("button");
  reset.type = "button";
  reset.className = "viewer-toggle viewer-reset";
  reset.textContent = "Reset view";
  reset.addEventListener("click", frameCamera);
  legend.appendChild(reset);

  /** Show exactly the named groups; hide everything else. */
  function showOnly(predicate) {
    setDecals(predicate({ name: "decals", group: "skin" }));
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
    ["Everything", (m) => m.group !== "dock"],
    ["Skins off", (m) => m.group !== "skin" && m.group !== "dock"],
    ["Subframe only", (m) => m.group === "structure"],
    ["Structure + drive", (m) => m.group === "structure" || m.group === "drive"],
    ["Equipment", (m) => m.group === "equipment" || m.group === "structure"],
    ["On the dock", (m) => m.group !== "structure" && m.group !== "equipment"],
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
