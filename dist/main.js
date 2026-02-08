"use strict";
(self["webpackChunklark_mermaid_addon"] = self["webpackChunklark_mermaid_addon"] || []).push([[792],{

/***/ 1237
(__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) {


// EXTERNAL MODULE: ./node_modules/react/jsx-runtime.js
var jsx_runtime = __webpack_require__(4848);
// EXTERNAL MODULE: ./node_modules/react/index.js
var react = __webpack_require__(6540);
// EXTERNAL MODULE: ./node_modules/react-dom/index.js
var react_dom = __webpack_require__(961);
// EXTERNAL MODULE: ./node_modules/@lark-opdev/block-docs-addon-api/dist/es/index.js
var es = __webpack_require__(5862);
;// ./src/utils/constants.ts

const MERMAID_KEYWORDS = [
  "graph ",
  "graph\n",
  "flowchart ",
  "flowchart\n",
  "sequenceDiagram",
  "classDiagram",
  "stateDiagram",
  "erDiagram",
  "journey",
  "gantt",
  "pie ",
  "quadrantChart",
  "requirementDiagram",
  "gitGraph",
  "mindmap",
  "timeline",
  "zenuml",
  "sankey",
  "xychart",
  "block-beta"
];

;// ./src/utils/mermaidDetector.ts


function isMermaidCode(text) {
  const trimmed = text.trim();
  return MERMAID_KEYWORDS.some((keyword) => trimmed.startsWith(keyword));
}

;// ./src/utils/normalizeCode.ts

function normalizeCode(code) {
  let normalized = code.replace(/［/g, "[").replace(/］/g, "]").replace(/（/g, "(").replace(/）/g, ")").replace(/｛/g, "{").replace(/｝/g, "}").replace(/＜/g, "<").replace(/＞/g, ">").replace(/：/g, ":").replace(/；/g, ";").replace(/，/g, ",").replace(/｜/g, "|");
  normalized = normalized.replace(/\u201C/g, "#quot;").replace(/\u201D/g, "#quot;");
  normalized = normalized.replace(/\u2018/g, "#apos;");
  normalized = normalized.replace(/\[([^\]]*)\]/g, (_match, content) => {
    const escaped = content.replace(/"/g, "#quot;");
    return "[" + escaped + "]";
  });
  return normalized;
}

;// ./src/utils/svgToImage.ts

function svgToDataUrl(svgString) {
  return new Promise((resolve, reject) => {
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgString, "image/svg+xml");
    const svgEl = svgDoc.documentElement;
    let width = parseFloat(svgEl.getAttribute("width") || "0");
    let height = parseFloat(svgEl.getAttribute("height") || "0");
    const viewBox = svgEl.getAttribute("viewBox");
    if (viewBox && (!width || !height)) {
      const parts = viewBox.split(/[\s,]+/);
      if (parts.length === 4) {
        width = parseFloat(parts[2]) || 800;
        height = parseFloat(parts[3]) || 600;
      }
    }
    if (!width)
      width = 800;
    if (!height)
      height = 600;
    svgEl.setAttribute("width", String(width));
    svgEl.setAttribute("height", String(height));
    const serializer = new XMLSerializer();
    const fixedSvg = serializer.serializeToString(svgEl);
    const svgBase64 = btoa(unescape(encodeURIComponent(fixedSvg)));
    const svgDataUrl = `data:image/svg+xml;base64,${svgBase64}`;
    const img = new Image();
    img.onload = () => {
      const scale = 2;
      const canvas = document.createElement("canvas");
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL("image/png");
      resolve({ dataUrl, width: width * scale, height: height * scale });
    };
    img.onerror = () => {
      reject(new Error("Failed to load SVG as image"));
    };
    img.src = svgDataUrl;
  });
}

;// ./src/hooks/useTransformer.ts

var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};





let mermaidInstance = null;
let mermaidInitPromise = null;
let renderCounter = 0;
function ensureMermaid() {
  return __async(this, null, function* () {
    if (mermaidInstance)
      return mermaidInstance;
    if (!mermaidInitPromise) {
      mermaidInitPromise = (() => __async(this, null, function* () {
        const { default: mermaid } = yield __webpack_require__.e(/* import() */ 121).then(__webpack_require__.bind(__webpack_require__, 9465));
        const { mermaidConfig } = yield __webpack_require__.e(/* import() */ 716).then(__webpack_require__.bind(__webpack_require__, 9716));
        mermaid.initialize(mermaidConfig);
        mermaidInstance = mermaid;
      }))();
    }
    yield mermaidInitPromise;
    return mermaidInstance;
  });
}
function collectMermaidBlocks(snapshot, parent) {
  var _a, _b;
  const results = [];
  if (snapshot.type === es/* BlockType */._B.CODE && parent) {
    const text = (_b = (_a = snapshot.data) == null ? void 0 : _a.plain_text) != null ? _b : "";
    if (text && isMermaidCode(text)) {
      results.push({ snapshot, parentSnapshot: parent, code: text });
    }
  }
  if (snapshot.childSnapshots) {
    for (const child of snapshot.childSnapshots) {
      results.push(...collectMermaidBlocks(child, snapshot));
    }
  }
  return results;
}
function dataUrlToFile(dataUrl, filename) {
  var _a;
  const [meta, base64] = dataUrl.split(",");
  const mime = ((_a = meta.match(/:(.*?);/)) == null ? void 0 : _a[1]) || "image/png";
  const binary = atob(base64);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  return new File([array], filename, { type: mime });
}
function useTransformer() {
  const [status, setStatus] = (0,react.useState)("idle");
  const [message, setMessage] = (0,react.useState)("");
  const [result, setResult] = (0,react.useState)(null);
  const apiRef = (0,react.useRef)(null);
  function getApi() {
    if (!apiRef.current) {
      apiRef.current = new es/* BlockitClient */.MN().initAPI();
    }
    return apiRef.current;
  }
  function insertImage(api, block, dataUrl, svg, width, height, index) {
    return __async(this, null, function* () {
      const parentRef = block.parentSnapshot.ref;
      const insertPosition = block.snapshot.childIndex + 1;
      try {
        console.log("[Mermaid] Strategy 1: insertBlocksByHTML with <img> data URL");
        const result2 = yield api.Document.insertBlocksByHTML(
          block.snapshot.ref,
          `<img src="${dataUrl}" width="${width}" height="${height}" alt="Mermaid diagram" />`
        );
        console.log("[Mermaid] insertBlocksByHTML result:", result2);
        return;
      } catch (err) {
        console.warn("[Mermaid] Strategy 1 failed:", err);
      }
      try {
        console.log("[Mermaid] Strategy 2: ImageBlock.insertByUploadImage with File");
        const file = dataUrlToFile(dataUrl, `mermaid-${index + 1}.png`);
        console.log("[Mermaid] File created:", file.name, file.size, file.type);
        const result2 = yield api.Block.ImageBlock.insertByUploadImage(
          parentRef,
          insertPosition,
          file
        );
        console.log("[Mermaid] insertByUploadImage result:", result2);
        return;
      } catch (err) {
        console.warn("[Mermaid] Strategy 2 failed:", err);
      }
      try {
        console.log("[Mermaid] Strategy 3: insertBlocksByMarkdown");
        const result2 = yield api.Document.insertBlocksByMarkdown(
          `![Mermaid Diagram](${dataUrl})`,
          block.snapshot.ref
        );
        console.log("[Mermaid] insertBlocksByMarkdown result:", result2);
        return;
      } catch (err) {
        console.warn("[Mermaid] Strategy 3 failed:", err);
      }
      try {
        console.log("[Mermaid] Strategy 4: insertBlocksByHTML with inline SVG");
        const result2 = yield api.Document.insertBlocksByHTML(
          block.snapshot.ref,
          svg
        );
        console.log("[Mermaid] insertBlocksByHTML (SVG) result:", result2);
        return;
      } catch (err) {
        console.warn("[Mermaid] Strategy 4 failed:", err);
      }
      try {
        console.log("[Mermaid] Strategy 5: Preview.uploadImage + Block.insertBlock");
        const uploadResult = yield api.Service.Preview.uploadImage({
          dataUrl,
          filename: `mermaid-${index + 1}.png`,
          width,
          height
        });
        console.log("[Mermaid] uploadImage result:", uploadResult);
        yield api.Block.insertBlock(parentRef, insertPosition, {
          type: es/* BlockType */._B.IMAGE,
          data: {
            token: (uploadResult == null ? void 0 : uploadResult.token) || uploadResult,
            width,
            height
          }
        });
        return;
      } catch (err) {
        console.warn("[Mermaid] Strategy 5 failed:", err);
      }
      throw new Error("All image insertion strategies failed. Check console for details.");
    });
  }
  const transform = (0,react.useCallback)((removeCodeBlocks) => __async(this, null, function* () {
    setStatus("scanning");
    setMessage("Scanning document...");
    setResult(null);
    try {
      const api = getApi();
      const docRef = yield api.getActiveDocumentRef();
      const rootBlock = yield api.Document.getRootBlock(docRef);
      const mermaidBlocks = collectMermaidBlocks(rootBlock, null);
      if (mermaidBlocks.length === 0) {
        setStatus("done");
        setMessage("No mermaid code blocks found.");
        setResult({ transformed: 0, failed: 0, errors: [] });
        return;
      }
      setStatus("transforming");
      setMessage(`Transforming ${mermaidBlocks.length} block(s)...`);
      console.log("[Mermaid] API Document methods:", Object.keys(api.Document || {}));
      console.log("[Mermaid] API Block methods:", Object.keys(api.Block || {}));
      console.log("[Mermaid] API Service methods:", Object.keys(api.Service || {}));
      const mermaid = yield ensureMermaid();
      let transformed = 0;
      let failed = 0;
      const errors = [];
      const reversed = [...mermaidBlocks].reverse();
      for (let i = 0; i < reversed.length; i++) {
        const block = reversed[i];
        try {
          const normalized = normalizeCode(block.code.trim());
          const id = `mermaid-transform-${Date.now()}-${++renderCounter}`;
          const { svg } = yield mermaid.render(id, normalized);
          const { dataUrl, width, height } = yield svgToDataUrl(svg);
          console.log("[Mermaid] Rendered block", block.snapshot.id, "- PNG size:", dataUrl.length, "dims:", width, "x", height);
          yield insertImage(api, block, dataUrl, svg, width, height, i);
          if (removeCodeBlocks) {
            yield api.Block.removeBlock(block.snapshot.ref);
          }
          transformed++;
          setMessage(`Transformed ${transformed}/${mermaidBlocks.length}...`);
        } catch (err) {
          failed++;
          const msg = err instanceof Error ? err.message : String(err);
          errors.push(`Block ${block.snapshot.id}: ${msg}`);
          console.error("[Mermaid] Transform error for block:", block.snapshot.id, err);
        }
      }
      setStatus("done");
      setResult({ transformed, failed, errors });
      if (failed === 0) {
        setMessage(`Done! Inserted ${transformed} diagram(s).`);
      } else {
        setMessage(`Done. ${transformed} inserted, ${failed} failed.`);
      }
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Failed to scan document");
      console.error("[Mermaid] Transform error:", err);
    }
  }), []);
  return { status, message, result, transform };
}

;// ./src/App.tsx




function App() {
  const { status, message, result, transform } = useTransformer();
  const [removeCode, setRemoveCode] = (0,react.useState)(false);
  (0,react.useEffect)(() => {
    transform(false);
  }, [transform]);
  const isWorking = status === "scanning" || status === "transforming";
  return /* @__PURE__ */ (0,jsx_runtime.jsxs)("div", { className: "panel", children: [
    /* @__PURE__ */ (0,jsx_runtime.jsxs)("div", { className: "panel-header", children: [
      /* @__PURE__ */ (0,jsx_runtime.jsxs)("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "#6366f1", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
        /* @__PURE__ */ (0,jsx_runtime.jsx)("rect", { x: "3", y: "3", width: "7", height: "7" }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("rect", { x: "14", y: "3", width: "7", height: "7" }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("rect", { x: "14", y: "14", width: "7", height: "7" }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("rect", { x: "3", y: "14", width: "7", height: "7" })
      ] }),
      /* @__PURE__ */ (0,jsx_runtime.jsx)("span", { className: "panel-title", children: "Mermaid Transformer" })
    ] }),
    /* @__PURE__ */ (0,jsx_runtime.jsxs)("div", { className: "panel-body", children: [
      /* @__PURE__ */ (0,jsx_runtime.jsxs)("div", { className: `status ${status}`, children: [
        isWorking && /* @__PURE__ */ (0,jsx_runtime.jsx)("span", { className: "spinner" }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)("span", { children: message })
      ] }),
      result && result.errors.length > 0 && /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { className: "errors", children: result.errors.map((err, i) => /* @__PURE__ */ (0,jsx_runtime.jsx)("div", { className: "error-item", children: err }, i)) }),
      /* @__PURE__ */ (0,jsx_runtime.jsxs)("div", { className: "actions", children: [
        /* @__PURE__ */ (0,jsx_runtime.jsxs)("label", { className: "checkbox-label", children: [
          /* @__PURE__ */ (0,jsx_runtime.jsx)(
            "input",
            {
              type: "checkbox",
              checked: removeCode,
              onChange: (e) => setRemoveCode(e.target.checked)
            }
          ),
          "Remove code blocks after transforming"
        ] }),
        /* @__PURE__ */ (0,jsx_runtime.jsx)(
          "button",
          {
            className: "transform-btn",
            onClick: () => transform(removeCode),
            disabled: isWorking,
            children: isWorking ? "Transforming..." : status === "done" ? "Transform Again" : "Transform"
          }
        )
      ] })
    ] })
  ] });
}

;// ./src/index.tsx






react_dom.render(
  /* @__PURE__ */ (0,jsx_runtime.jsx)(react.StrictMode, { children: /* @__PURE__ */ (0,jsx_runtime.jsx)(App, {}) }),
  document.getElementById("root")
);


/***/ }

},
/******/ __webpack_require__ => { // webpackRuntimeModules
/******/ var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
/******/ __webpack_require__.O(0, [121], () => (__webpack_exec__(1237)));
/******/ var __webpack_exports__ = __webpack_require__.O();
/******/ }
]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LEVBQ1Asb0NBQUMsZ0JBQWdCLEVBQWhCLEVBQ0MsOENBQUMsR0FBRyxJQUFDLEdBQ1A7QUFBQSxFQUNBLFNBQVMsZUFBZSxNQUFNO0FBQ2hDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vbGFyay1tZXJtYWlkLWFkZG9uLy4vc3JjL3V0aWxzL2NvbnN0YW50cy50cyIsIndlYnBhY2s6Ly9sYXJrLW1lcm1haWQtYWRkb24vLi9zcmMvdXRpbHMvbWVybWFpZERldGVjdG9yLnRzIiwid2VicGFjazovL2xhcmstbWVybWFpZC1hZGRvbi8uL3NyYy91dGlscy9ub3JtYWxpemVDb2RlLnRzIiwid2VicGFjazovL2xhcmstbWVybWFpZC1hZGRvbi8uL3NyYy91dGlscy9zdmdUb0ltYWdlLnRzIiwid2VicGFjazovL2xhcmstbWVybWFpZC1hZGRvbi8uL3NyYy9ob29rcy91c2VUcmFuc2Zvcm1lci50cyIsIndlYnBhY2s6Ly9sYXJrLW1lcm1haWQtYWRkb24vLi9zcmMvQXBwLnRzeCIsIndlYnBhY2s6Ly9sYXJrLW1lcm1haWQtYWRkb24vLi9zcmMvaW5kZXgudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjb25zdCBNRVJNQUlEX0tFWVdPUkRTID0gW1xuICAnZ3JhcGggJyxcbiAgJ2dyYXBoXFxuJyxcbiAgJ2Zsb3djaGFydCAnLFxuICAnZmxvd2NoYXJ0XFxuJyxcbiAgJ3NlcXVlbmNlRGlhZ3JhbScsXG4gICdjbGFzc0RpYWdyYW0nLFxuICAnc3RhdGVEaWFncmFtJyxcbiAgJ2VyRGlhZ3JhbScsXG4gICdqb3VybmV5JyxcbiAgJ2dhbnR0JyxcbiAgJ3BpZSAnLFxuICAncXVhZHJhbnRDaGFydCcsXG4gICdyZXF1aXJlbWVudERpYWdyYW0nLFxuICAnZ2l0R3JhcGgnLFxuICAnbWluZG1hcCcsXG4gICd0aW1lbGluZScsXG4gICd6ZW51bWwnLFxuICAnc2Fua2V5JyxcbiAgJ3h5Y2hhcnQnLFxuICAnYmxvY2stYmV0YScsXG5dO1xuIiwiaW1wb3J0IHsgTUVSTUFJRF9LRVlXT1JEUyB9IGZyb20gJy4vY29uc3RhbnRzJztcblxuLyoqIENoZWNrIHdoZXRoZXIgYHRleHRgIGxvb2tzIGxpa2UgTWVybWFpZCBkaWFncmFtIGNvZGUuICovXG5leHBvcnQgZnVuY3Rpb24gaXNNZXJtYWlkQ29kZSh0ZXh0OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgY29uc3QgdHJpbW1lZCA9IHRleHQudHJpbSgpO1xuICByZXR1cm4gTUVSTUFJRF9LRVlXT1JEUy5zb21lKChrZXl3b3JkKSA9PiB0cmltbWVkLnN0YXJ0c1dpdGgoa2V5d29yZCkpO1xufVxuIiwiLyoqXG4gKiBDb252ZXJ0IGZ1bGwtd2lkdGggQ0pLIGNoYXJhY3RlcnMgdG8gQVNDSUkgZXF1aXZhbGVudHMgYW5kIGZpeCBjb21tb25cbiAqIHF1b3RlIGlzc3VlcyB0aGF0IGJyZWFrIE1lcm1haWQgc3ludGF4LlxuICpcbiAqIFBvcnRlZCBmcm9tIGxhcmstbWVybWFpZC1yZW5kZXJlci51c2VyLmpzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplQ29kZShjb2RlOiBzdHJpbmcpOiBzdHJpbmcge1xuICBsZXQgbm9ybWFsaXplZCA9IGNvZGVcbiAgICAucmVwbGFjZSgv77y7L2csICdbJylcbiAgICAucmVwbGFjZSgv77y9L2csICddJylcbiAgICAucmVwbGFjZSgv77yIL2csICcoJylcbiAgICAucmVwbGFjZSgv77yJL2csICcpJylcbiAgICAucmVwbGFjZSgv772bL2csICd7JylcbiAgICAucmVwbGFjZSgv772dL2csICd9JylcbiAgICAucmVwbGFjZSgv77ycL2csICc8JylcbiAgICAucmVwbGFjZSgv77yeL2csICc+JylcbiAgICAucmVwbGFjZSgv77yaL2csICc6JylcbiAgICAucmVwbGFjZSgv77ybL2csICc7JylcbiAgICAucmVwbGFjZSgv77yML2csICcsJylcbiAgICAucmVwbGFjZSgv772cL2csICd8Jyk7XG5cbiAgLy8gU21hcnQtcXVvdGUg4oaSIEhUTUwgZW50aXR5IHNvIHRoZXkgZG9uJ3QgYnJlYWsgTWVybWFpZCdzIG93biBxdW90ZSBwYXJzaW5nXG4gIG5vcm1hbGl6ZWQgPSBub3JtYWxpemVkLnJlcGxhY2UoL1xcdTIwMUMvZywgJyNxdW90OycpLnJlcGxhY2UoL1xcdTIwMUQvZywgJyNxdW90OycpO1xuICBub3JtYWxpemVkID0gbm9ybWFsaXplZC5yZXBsYWNlKC9cXHUyMDE4L2csICcjYXBvczsnKTtcblxuICAvLyBFc2NhcGUgcmVndWxhciBkb3VibGUtcXVvdGVzIGluc2lkZSBicmFja2V0IGNvbnRlbnQgWy4uLl1cbiAgbm9ybWFsaXplZCA9IG5vcm1hbGl6ZWQucmVwbGFjZSgvXFxbKFteXFxdXSopXFxdL2csIChfbWF0Y2gsIGNvbnRlbnQ6IHN0cmluZykgPT4ge1xuICAgIGNvbnN0IGVzY2FwZWQgPSBjb250ZW50LnJlcGxhY2UoL1wiL2csICcjcXVvdDsnKTtcbiAgICByZXR1cm4gJ1snICsgZXNjYXBlZCArICddJztcbiAgfSk7XG5cbiAgcmV0dXJuIG5vcm1hbGl6ZWQ7XG59XG4iLCIvKipcbiAqIENvbnZlcnQgYW4gU1ZHIHN0cmluZyB0byBhIFBORyBkYXRhIFVSTCB2aWEgY2FudmFzLlxuICogVXNlcyAyeCBzY2FsZSBmb3IgcmV0aW5hIGNsYXJpdHkuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSW1hZ2VSZXN1bHQge1xuICBkYXRhVXJsOiBzdHJpbmc7XG4gIHdpZHRoOiBudW1iZXI7XG4gIGhlaWdodDogbnVtYmVyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3ZnVG9EYXRhVXJsKHN2Z1N0cmluZzogc3RyaW5nKTogUHJvbWlzZTxJbWFnZVJlc3VsdD4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IHBhcnNlciA9IG5ldyBET01QYXJzZXIoKTtcbiAgICBjb25zdCBzdmdEb2MgPSBwYXJzZXIucGFyc2VGcm9tU3RyaW5nKHN2Z1N0cmluZywgJ2ltYWdlL3N2Zyt4bWwnKTtcbiAgICBjb25zdCBzdmdFbCA9IHN2Z0RvYy5kb2N1bWVudEVsZW1lbnQ7XG5cbiAgICBsZXQgd2lkdGggPSBwYXJzZUZsb2F0KHN2Z0VsLmdldEF0dHJpYnV0ZSgnd2lkdGgnKSB8fCAnMCcpO1xuICAgIGxldCBoZWlnaHQgPSBwYXJzZUZsb2F0KHN2Z0VsLmdldEF0dHJpYnV0ZSgnaGVpZ2h0JykgfHwgJzAnKTtcblxuICAgIGNvbnN0IHZpZXdCb3ggPSBzdmdFbC5nZXRBdHRyaWJ1dGUoJ3ZpZXdCb3gnKTtcbiAgICBpZiAodmlld0JveCAmJiAoIXdpZHRoIHx8ICFoZWlnaHQpKSB7XG4gICAgICBjb25zdCBwYXJ0cyA9IHZpZXdCb3guc3BsaXQoL1tcXHMsXSsvKTtcbiAgICAgIGlmIChwYXJ0cy5sZW5ndGggPT09IDQpIHtcbiAgICAgICAgd2lkdGggPSBwYXJzZUZsb2F0KHBhcnRzWzJdKSB8fCA4MDA7XG4gICAgICAgIGhlaWdodCA9IHBhcnNlRmxvYXQocGFydHNbM10pIHx8IDYwMDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIXdpZHRoKSB3aWR0aCA9IDgwMDtcbiAgICBpZiAoIWhlaWdodCkgaGVpZ2h0ID0gNjAwO1xuXG4gICAgc3ZnRWwuc2V0QXR0cmlidXRlKCd3aWR0aCcsIFN0cmluZyh3aWR0aCkpO1xuICAgIHN2Z0VsLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgU3RyaW5nKGhlaWdodCkpO1xuICAgIGNvbnN0IHNlcmlhbGl6ZXIgPSBuZXcgWE1MU2VyaWFsaXplcigpO1xuICAgIGNvbnN0IGZpeGVkU3ZnID0gc2VyaWFsaXplci5zZXJpYWxpemVUb1N0cmluZyhzdmdFbCk7XG5cbiAgICBjb25zdCBzdmdCYXNlNjQgPSBidG9hKHVuZXNjYXBlKGVuY29kZVVSSUNvbXBvbmVudChmaXhlZFN2ZykpKTtcbiAgICBjb25zdCBzdmdEYXRhVXJsID0gYGRhdGE6aW1hZ2Uvc3ZnK3htbDtiYXNlNjQsJHtzdmdCYXNlNjR9YDtcblxuICAgIGNvbnN0IGltZyA9IG5ldyBJbWFnZSgpO1xuICAgIGltZy5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICBjb25zdCBzY2FsZSA9IDI7XG4gICAgICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICAgIGNhbnZhcy53aWR0aCA9IHdpZHRoICogc2NhbGU7XG4gICAgICBjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0ICogc2NhbGU7XG5cbiAgICAgIGNvbnN0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpITtcbiAgICAgIGN0eC5maWxsU3R5bGUgPSAnI2ZmZmZmZic7XG4gICAgICBjdHguZmlsbFJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcbiAgICAgIGN0eC5zY2FsZShzY2FsZSwgc2NhbGUpO1xuICAgICAgY3R4LmRyYXdJbWFnZShpbWcsIDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xuXG4gICAgICBjb25zdCBkYXRhVXJsID0gY2FudmFzLnRvRGF0YVVSTCgnaW1hZ2UvcG5nJyk7XG4gICAgICByZXNvbHZlKHsgZGF0YVVybCwgd2lkdGg6IHdpZHRoICogc2NhbGUsIGhlaWdodDogaGVpZ2h0ICogc2NhbGUgfSk7XG4gICAgfTtcblxuICAgIGltZy5vbmVycm9yID0gKCkgPT4ge1xuICAgICAgcmVqZWN0KG5ldyBFcnJvcignRmFpbGVkIHRvIGxvYWQgU1ZHIGFzIGltYWdlJykpO1xuICAgIH07XG5cbiAgICBpbWcuc3JjID0gc3ZnRGF0YVVybDtcbiAgfSk7XG59XG4iLCJpbXBvcnQgeyB1c2VDYWxsYmFjaywgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7XG4gIEJsb2NraXRDbGllbnQsXG4gIEJsb2NrVHlwZSxcbiAgQmxvY2tTbmFwc2hvdCxcbiAgRG9jdW1lbnRSZWYsXG59IGZyb20gJ0BsYXJrLW9wZGV2L2Jsb2NrLWRvY3MtYWRkb24tYXBpJztcbmltcG9ydCB7IGlzTWVybWFpZENvZGUgfSBmcm9tICcuLi91dGlscy9tZXJtYWlkRGV0ZWN0b3InO1xuaW1wb3J0IHsgbm9ybWFsaXplQ29kZSB9IGZyb20gJy4uL3V0aWxzL25vcm1hbGl6ZUNvZGUnO1xuaW1wb3J0IHsgc3ZnVG9EYXRhVXJsIH0gZnJvbSAnLi4vdXRpbHMvc3ZnVG9JbWFnZSc7XG5cbmludGVyZmFjZSBNZXJtYWlkQ29kZUJsb2NrIHtcbiAgc25hcHNob3Q6IEJsb2NrU25hcHNob3Q7XG4gIHBhcmVudFNuYXBzaG90OiBCbG9ja1NuYXBzaG90O1xuICBjb2RlOiBzdHJpbmc7XG59XG5cbnR5cGUgVHJhbnNmb3JtU3RhdHVzID0gJ2lkbGUnIHwgJ3NjYW5uaW5nJyB8ICd0cmFuc2Zvcm1pbmcnIHwgJ2RvbmUnIHwgJ2Vycm9yJztcblxuaW50ZXJmYWNlIFRyYW5zZm9ybVJlc3VsdCB7XG4gIHRyYW5zZm9ybWVkOiBudW1iZXI7XG4gIGZhaWxlZDogbnVtYmVyO1xuICBlcnJvcnM6IHN0cmluZ1tdO1xufVxuXG5pbnRlcmZhY2UgVXNlVHJhbnNmb3JtZXJSZXR1cm4ge1xuICBzdGF0dXM6IFRyYW5zZm9ybVN0YXR1cztcbiAgbWVzc2FnZTogc3RyaW5nO1xuICByZXN1bHQ6IFRyYW5zZm9ybVJlc3VsdCB8IG51bGw7XG4gIHRyYW5zZm9ybTogKHJlbW92ZUNvZGVCbG9ja3M6IGJvb2xlYW4pID0+IFByb21pc2U8dm9pZD47XG59XG5cbmxldCBtZXJtYWlkSW5zdGFuY2U6IHR5cGVvZiBpbXBvcnQoJ21lcm1haWQnKVsnZGVmYXVsdCddIHwgbnVsbCA9IG51bGw7XG5sZXQgbWVybWFpZEluaXRQcm9taXNlOiBQcm9taXNlPHZvaWQ+IHwgbnVsbCA9IG51bGw7XG5sZXQgcmVuZGVyQ291bnRlciA9IDA7XG5cbmFzeW5jIGZ1bmN0aW9uIGVuc3VyZU1lcm1haWQoKSB7XG4gIGlmIChtZXJtYWlkSW5zdGFuY2UpIHJldHVybiBtZXJtYWlkSW5zdGFuY2U7XG4gIGlmICghbWVybWFpZEluaXRQcm9taXNlKSB7XG4gICAgbWVybWFpZEluaXRQcm9taXNlID0gKGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IHsgZGVmYXVsdDogbWVybWFpZCB9ID0gYXdhaXQgaW1wb3J0KCdtZXJtYWlkJyk7XG4gICAgICBjb25zdCB7IG1lcm1haWRDb25maWcgfSA9IGF3YWl0IGltcG9ydCgnLi4vdXRpbHMvbWVybWFpZENvbmZpZycpO1xuICAgICAgbWVybWFpZC5pbml0aWFsaXplKG1lcm1haWRDb25maWcpO1xuICAgICAgbWVybWFpZEluc3RhbmNlID0gbWVybWFpZDtcbiAgICB9KSgpO1xuICB9XG4gIGF3YWl0IG1lcm1haWRJbml0UHJvbWlzZTtcbiAgcmV0dXJuIG1lcm1haWRJbnN0YW5jZSE7XG59XG5cbmZ1bmN0aW9uIGNvbGxlY3RNZXJtYWlkQmxvY2tzKFxuICBzbmFwc2hvdDogQmxvY2tTbmFwc2hvdCxcbiAgcGFyZW50OiBCbG9ja1NuYXBzaG90IHwgbnVsbCxcbik6IE1lcm1haWRDb2RlQmxvY2tbXSB7XG4gIGNvbnN0IHJlc3VsdHM6IE1lcm1haWRDb2RlQmxvY2tbXSA9IFtdO1xuXG4gIGlmIChzbmFwc2hvdC50eXBlID09PSBCbG9ja1R5cGUuQ09ERSAmJiBwYXJlbnQpIHtcbiAgICBjb25zdCB0ZXh0ID0gKHNuYXBzaG90LmRhdGEgYXMgYW55KT8ucGxhaW5fdGV4dCA/PyAnJztcbiAgICBpZiAodGV4dCAmJiBpc01lcm1haWRDb2RlKHRleHQpKSB7XG4gICAgICByZXN1bHRzLnB1c2goeyBzbmFwc2hvdCwgcGFyZW50U25hcHNob3Q6IHBhcmVudCwgY29kZTogdGV4dCB9KTtcbiAgICB9XG4gIH1cblxuICBpZiAoc25hcHNob3QuY2hpbGRTbmFwc2hvdHMpIHtcbiAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIHNuYXBzaG90LmNoaWxkU25hcHNob3RzKSB7XG4gICAgICByZXN1bHRzLnB1c2goLi4uY29sbGVjdE1lcm1haWRCbG9ja3MoY2hpbGQsIHNuYXBzaG90KSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdHM7XG59XG5cbi8qKiBDb252ZXJ0IGEgZGF0YSBVUkwgdG8gYSBGaWxlIG9iamVjdCAqL1xuZnVuY3Rpb24gZGF0YVVybFRvRmlsZShkYXRhVXJsOiBzdHJpbmcsIGZpbGVuYW1lOiBzdHJpbmcpOiBGaWxlIHtcbiAgY29uc3QgW21ldGEsIGJhc2U2NF0gPSBkYXRhVXJsLnNwbGl0KCcsJyk7XG4gIGNvbnN0IG1pbWUgPSBtZXRhLm1hdGNoKC86KC4qPyk7Lyk/LlsxXSB8fCAnaW1hZ2UvcG5nJztcbiAgY29uc3QgYmluYXJ5ID0gYXRvYihiYXNlNjQpO1xuICBjb25zdCBhcnJheSA9IG5ldyBVaW50OEFycmF5KGJpbmFyeS5sZW5ndGgpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGJpbmFyeS5sZW5ndGg7IGkrKykge1xuICAgIGFycmF5W2ldID0gYmluYXJ5LmNoYXJDb2RlQXQoaSk7XG4gIH1cbiAgcmV0dXJuIG5ldyBGaWxlKFthcnJheV0sIGZpbGVuYW1lLCB7IHR5cGU6IG1pbWUgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VUcmFuc2Zvcm1lcigpOiBVc2VUcmFuc2Zvcm1lclJldHVybiB7XG4gIGNvbnN0IFtzdGF0dXMsIHNldFN0YXR1c10gPSB1c2VTdGF0ZTxUcmFuc2Zvcm1TdGF0dXM+KCdpZGxlJyk7XG4gIGNvbnN0IFttZXNzYWdlLCBzZXRNZXNzYWdlXSA9IHVzZVN0YXRlKCcnKTtcbiAgY29uc3QgW3Jlc3VsdCwgc2V0UmVzdWx0XSA9IHVzZVN0YXRlPFRyYW5zZm9ybVJlc3VsdCB8IG51bGw+KG51bGwpO1xuICBjb25zdCBhcGlSZWYgPSB1c2VSZWY8UmV0dXJuVHlwZTxCbG9ja2l0Q2xpZW50Wydpbml0QVBJJ10+IHwgbnVsbD4obnVsbCk7XG5cbiAgZnVuY3Rpb24gZ2V0QXBpKCkge1xuICAgIGlmICghYXBpUmVmLmN1cnJlbnQpIHtcbiAgICAgIGFwaVJlZi5jdXJyZW50ID0gbmV3IEJsb2NraXRDbGllbnQoKS5pbml0QVBJKCk7XG4gICAgfVxuICAgIHJldHVybiBhcGlSZWYuY3VycmVudDtcbiAgfVxuXG4gIC8qKiBUcnkgbXVsdGlwbGUgc3RyYXRlZ2llcyB0byBpbnNlcnQgYW4gaW1hZ2UgaW50byB0aGUgZG9jdW1lbnQgKi9cbiAgYXN5bmMgZnVuY3Rpb24gaW5zZXJ0SW1hZ2UoXG4gICAgYXBpOiBSZXR1cm5UeXBlPEJsb2NraXRDbGllbnRbJ2luaXRBUEknXT4sXG4gICAgYmxvY2s6IE1lcm1haWRDb2RlQmxvY2ssXG4gICAgZGF0YVVybDogc3RyaW5nLFxuICAgIHN2Zzogc3RyaW5nLFxuICAgIHdpZHRoOiBudW1iZXIsXG4gICAgaGVpZ2h0OiBudW1iZXIsXG4gICAgaW5kZXg6IG51bWJlcixcbiAgKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcGFyZW50UmVmID0gYmxvY2sucGFyZW50U25hcHNob3QucmVmO1xuICAgIGNvbnN0IGluc2VydFBvc2l0aW9uID0gYmxvY2suc25hcHNob3QuY2hpbGRJbmRleCArIDE7XG5cbiAgICAvLyBTdHJhdGVneSAxOiBpbnNlcnRCbG9ja3NCeUhUTUwgd2l0aCBpbmxpbmUgaW1hZ2VcbiAgICB0cnkge1xuICAgICAgY29uc29sZS5sb2coJ1tNZXJtYWlkXSBTdHJhdGVneSAxOiBpbnNlcnRCbG9ja3NCeUhUTUwgd2l0aCA8aW1nPiBkYXRhIFVSTCcpO1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgKGFwaSBhcyBhbnkpLkRvY3VtZW50Lmluc2VydEJsb2Nrc0J5SFRNTChcbiAgICAgICAgYmxvY2suc25hcHNob3QucmVmLFxuICAgICAgICBgPGltZyBzcmM9XCIke2RhdGFVcmx9XCIgd2lkdGg9XCIke3dpZHRofVwiIGhlaWdodD1cIiR7aGVpZ2h0fVwiIGFsdD1cIk1lcm1haWQgZGlhZ3JhbVwiIC8+YCxcbiAgICAgICk7XG4gICAgICBjb25zb2xlLmxvZygnW01lcm1haWRdIGluc2VydEJsb2Nrc0J5SFRNTCByZXN1bHQ6JywgcmVzdWx0KTtcbiAgICAgIHJldHVybjtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnNvbGUud2FybignW01lcm1haWRdIFN0cmF0ZWd5IDEgZmFpbGVkOicsIGVycik7XG4gICAgfVxuXG4gICAgLy8gU3RyYXRlZ3kgMjogaW5zZXJ0QnlVcGxvYWRJbWFnZSB3aXRoIEZpbGUgb2JqZWN0XG4gICAgdHJ5IHtcbiAgICAgIGNvbnNvbGUubG9nKCdbTWVybWFpZF0gU3RyYXRlZ3kgMjogSW1hZ2VCbG9jay5pbnNlcnRCeVVwbG9hZEltYWdlIHdpdGggRmlsZScpO1xuICAgICAgY29uc3QgZmlsZSA9IGRhdGFVcmxUb0ZpbGUoZGF0YVVybCwgYG1lcm1haWQtJHtpbmRleCArIDF9LnBuZ2ApO1xuICAgICAgY29uc29sZS5sb2coJ1tNZXJtYWlkXSBGaWxlIGNyZWF0ZWQ6JywgZmlsZS5uYW1lLCBmaWxlLnNpemUsIGZpbGUudHlwZSk7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCAoYXBpIGFzIGFueSkuQmxvY2suSW1hZ2VCbG9jay5pbnNlcnRCeVVwbG9hZEltYWdlKFxuICAgICAgICBwYXJlbnRSZWYsXG4gICAgICAgIGluc2VydFBvc2l0aW9uLFxuICAgICAgICBmaWxlLFxuICAgICAgKTtcbiAgICAgIGNvbnNvbGUubG9nKCdbTWVybWFpZF0gaW5zZXJ0QnlVcGxvYWRJbWFnZSByZXN1bHQ6JywgcmVzdWx0KTtcbiAgICAgIHJldHVybjtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnNvbGUud2FybignW01lcm1haWRdIFN0cmF0ZWd5IDIgZmFpbGVkOicsIGVycik7XG4gICAgfVxuXG4gICAgLy8gU3RyYXRlZ3kgMzogaW5zZXJ0QmxvY2tzQnlNYXJrZG93biB3aXRoIGlubGluZSBpbWFnZVxuICAgIHRyeSB7XG4gICAgICBjb25zb2xlLmxvZygnW01lcm1haWRdIFN0cmF0ZWd5IDM6IGluc2VydEJsb2Nrc0J5TWFya2Rvd24nKTtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IChhcGkgYXMgYW55KS5Eb2N1bWVudC5pbnNlcnRCbG9ja3NCeU1hcmtkb3duKFxuICAgICAgICBgIVtNZXJtYWlkIERpYWdyYW1dKCR7ZGF0YVVybH0pYCxcbiAgICAgICAgYmxvY2suc25hcHNob3QucmVmLFxuICAgICAgKTtcbiAgICAgIGNvbnNvbGUubG9nKCdbTWVybWFpZF0gaW5zZXJ0QmxvY2tzQnlNYXJrZG93biByZXN1bHQ6JywgcmVzdWx0KTtcbiAgICAgIHJldHVybjtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnNvbGUud2FybignW01lcm1haWRdIFN0cmF0ZWd5IDMgZmFpbGVkOicsIGVycik7XG4gICAgfVxuXG4gICAgLy8gU3RyYXRlZ3kgNDogaW5zZXJ0QmxvY2tzQnlIVE1MIHdpdGggaW5saW5lIFNWR1xuICAgIHRyeSB7XG4gICAgICBjb25zb2xlLmxvZygnW01lcm1haWRdIFN0cmF0ZWd5IDQ6IGluc2VydEJsb2Nrc0J5SFRNTCB3aXRoIGlubGluZSBTVkcnKTtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IChhcGkgYXMgYW55KS5Eb2N1bWVudC5pbnNlcnRCbG9ja3NCeUhUTUwoXG4gICAgICAgIGJsb2NrLnNuYXBzaG90LnJlZixcbiAgICAgICAgc3ZnLFxuICAgICAgKTtcbiAgICAgIGNvbnNvbGUubG9nKCdbTWVybWFpZF0gaW5zZXJ0QmxvY2tzQnlIVE1MIChTVkcpIHJlc3VsdDonLCByZXN1bHQpO1xuICAgICAgcmV0dXJuO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc29sZS53YXJuKCdbTWVybWFpZF0gU3RyYXRlZ3kgNCBmYWlsZWQ6JywgZXJyKTtcbiAgICB9XG5cbiAgICAvLyBTdHJhdGVneSA1OiBQcmV2aWV3LnVwbG9hZEltYWdlICsgQmxvY2suaW5zZXJ0QmxvY2sgKG9yaWdpbmFsIGFwcHJvYWNoKVxuICAgIHRyeSB7XG4gICAgICBjb25zb2xlLmxvZygnW01lcm1haWRdIFN0cmF0ZWd5IDU6IFByZXZpZXcudXBsb2FkSW1hZ2UgKyBCbG9jay5pbnNlcnRCbG9jaycpO1xuICAgICAgY29uc3QgdXBsb2FkUmVzdWx0ID0gYXdhaXQgKGFwaSBhcyBhbnkpLlNlcnZpY2UuUHJldmlldy51cGxvYWRJbWFnZSh7XG4gICAgICAgIGRhdGFVcmwsXG4gICAgICAgIGZpbGVuYW1lOiBgbWVybWFpZC0ke2luZGV4ICsgMX0ucG5nYCxcbiAgICAgICAgd2lkdGgsXG4gICAgICAgIGhlaWdodCxcbiAgICAgIH0pO1xuICAgICAgY29uc29sZS5sb2coJ1tNZXJtYWlkXSB1cGxvYWRJbWFnZSByZXN1bHQ6JywgdXBsb2FkUmVzdWx0KTtcbiAgICAgIGF3YWl0IGFwaS5CbG9jay5pbnNlcnRCbG9jayhwYXJlbnRSZWYsIGluc2VydFBvc2l0aW9uLCB7XG4gICAgICAgIHR5cGU6IEJsb2NrVHlwZS5JTUFHRSxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIHRva2VuOiB1cGxvYWRSZXN1bHQ/LnRva2VuIHx8IHVwbG9hZFJlc3VsdCxcbiAgICAgICAgICB3aWR0aCxcbiAgICAgICAgICBoZWlnaHQsXG4gICAgICAgIH0sXG4gICAgICB9IGFzIGFueSk7XG4gICAgICByZXR1cm47XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ1tNZXJtYWlkXSBTdHJhdGVneSA1IGZhaWxlZDonLCBlcnIpO1xuICAgIH1cblxuICAgIHRocm93IG5ldyBFcnJvcignQWxsIGltYWdlIGluc2VydGlvbiBzdHJhdGVnaWVzIGZhaWxlZC4gQ2hlY2sgY29uc29sZSBmb3IgZGV0YWlscy4nKTtcbiAgfVxuXG4gIGNvbnN0IHRyYW5zZm9ybSA9IHVzZUNhbGxiYWNrKGFzeW5jIChyZW1vdmVDb2RlQmxvY2tzOiBib29sZWFuKSA9PiB7XG4gICAgc2V0U3RhdHVzKCdzY2FubmluZycpO1xuICAgIHNldE1lc3NhZ2UoJ1NjYW5uaW5nIGRvY3VtZW50Li4uJyk7XG4gICAgc2V0UmVzdWx0KG51bGwpO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGFwaSA9IGdldEFwaSgpO1xuICAgICAgY29uc3QgZG9jUmVmOiBEb2N1bWVudFJlZiA9IGF3YWl0IGFwaS5nZXRBY3RpdmVEb2N1bWVudFJlZigpO1xuICAgICAgY29uc3Qgcm9vdEJsb2NrID0gYXdhaXQgYXBpLkRvY3VtZW50LmdldFJvb3RCbG9jayhkb2NSZWYpO1xuICAgICAgY29uc3QgbWVybWFpZEJsb2NrcyA9IGNvbGxlY3RNZXJtYWlkQmxvY2tzKHJvb3RCbG9jaywgbnVsbCk7XG5cbiAgICAgIGlmIChtZXJtYWlkQmxvY2tzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBzZXRTdGF0dXMoJ2RvbmUnKTtcbiAgICAgICAgc2V0TWVzc2FnZSgnTm8gbWVybWFpZCBjb2RlIGJsb2NrcyBmb3VuZC4nKTtcbiAgICAgICAgc2V0UmVzdWx0KHsgdHJhbnNmb3JtZWQ6IDAsIGZhaWxlZDogMCwgZXJyb3JzOiBbXSB9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBzZXRTdGF0dXMoJ3RyYW5zZm9ybWluZycpO1xuICAgICAgc2V0TWVzc2FnZShgVHJhbnNmb3JtaW5nICR7bWVybWFpZEJsb2Nrcy5sZW5ndGh9IGJsb2NrKHMpLi4uYCk7XG5cbiAgICAgIC8vIExvZyBhdmFpbGFibGUgQVBJIG1ldGhvZHMgZm9yIGRlYnVnZ2luZ1xuICAgICAgY29uc29sZS5sb2coJ1tNZXJtYWlkXSBBUEkgRG9jdW1lbnQgbWV0aG9kczonLCBPYmplY3Qua2V5cyhhcGkuRG9jdW1lbnQgfHwge30pKTtcbiAgICAgIGNvbnNvbGUubG9nKCdbTWVybWFpZF0gQVBJIEJsb2NrIG1ldGhvZHM6JywgT2JqZWN0LmtleXMoYXBpLkJsb2NrIHx8IHt9KSk7XG4gICAgICBjb25zb2xlLmxvZygnW01lcm1haWRdIEFQSSBTZXJ2aWNlIG1ldGhvZHM6JywgT2JqZWN0LmtleXMoYXBpLlNlcnZpY2UgfHwge30pKTtcblxuICAgICAgY29uc3QgbWVybWFpZCA9IGF3YWl0IGVuc3VyZU1lcm1haWQoKTtcbiAgICAgIGxldCB0cmFuc2Zvcm1lZCA9IDA7XG4gICAgICBsZXQgZmFpbGVkID0gMDtcbiAgICAgIGNvbnN0IGVycm9yczogc3RyaW5nW10gPSBbXTtcblxuICAgICAgLy8gUHJvY2VzcyBpbiByZXZlcnNlIG9yZGVyIHNvIGluc2VydGluZyBkb2Vzbid0IHNoaWZ0IHBvc2l0aW9uc1xuICAgICAgY29uc3QgcmV2ZXJzZWQgPSBbLi4ubWVybWFpZEJsb2Nrc10ucmV2ZXJzZSgpO1xuXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJldmVyc2VkLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGJsb2NrID0gcmV2ZXJzZWRbaV07XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3Qgbm9ybWFsaXplZCA9IG5vcm1hbGl6ZUNvZGUoYmxvY2suY29kZS50cmltKCkpO1xuICAgICAgICAgIGNvbnN0IGlkID0gYG1lcm1haWQtdHJhbnNmb3JtLSR7RGF0ZS5ub3coKX0tJHsrK3JlbmRlckNvdW50ZXJ9YDtcbiAgICAgICAgICBjb25zdCB7IHN2ZyB9ID0gYXdhaXQgbWVybWFpZC5yZW5kZXIoaWQsIG5vcm1hbGl6ZWQpO1xuXG4gICAgICAgICAgLy8gQ29udmVydCBTVkcgdG8gUE5HIGRhdGEgVVJMXG4gICAgICAgICAgY29uc3QgeyBkYXRhVXJsLCB3aWR0aCwgaGVpZ2h0IH0gPSBhd2FpdCBzdmdUb0RhdGFVcmwoc3ZnKTtcbiAgICAgICAgICBjb25zb2xlLmxvZygnW01lcm1haWRdIFJlbmRlcmVkIGJsb2NrJywgYmxvY2suc25hcHNob3QuaWQsICctIFBORyBzaXplOicsIGRhdGFVcmwubGVuZ3RoLCAnZGltczonLCB3aWR0aCwgJ3gnLCBoZWlnaHQpO1xuXG4gICAgICAgICAgYXdhaXQgaW5zZXJ0SW1hZ2UoYXBpLCBibG9jaywgZGF0YVVybCwgc3ZnLCB3aWR0aCwgaGVpZ2h0LCBpKTtcblxuICAgICAgICAgIC8vIE9wdGlvbmFsbHkgcmVtb3ZlIHRoZSBvcmlnaW5hbCBjb2RlIGJsb2NrXG4gICAgICAgICAgaWYgKHJlbW92ZUNvZGVCbG9ja3MpIHtcbiAgICAgICAgICAgIGF3YWl0IGFwaS5CbG9jay5yZW1vdmVCbG9jayhibG9jay5zbmFwc2hvdC5yZWYpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRyYW5zZm9ybWVkKys7XG4gICAgICAgICAgc2V0TWVzc2FnZShgVHJhbnNmb3JtZWQgJHt0cmFuc2Zvcm1lZH0vJHttZXJtYWlkQmxvY2tzLmxlbmd0aH0uLi5gKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgZmFpbGVkKys7XG4gICAgICAgICAgY29uc3QgbXNnID0gZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6IFN0cmluZyhlcnIpO1xuICAgICAgICAgIGVycm9ycy5wdXNoKGBCbG9jayAke2Jsb2NrLnNuYXBzaG90LmlkfTogJHttc2d9YCk7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignW01lcm1haWRdIFRyYW5zZm9ybSBlcnJvciBmb3IgYmxvY2s6JywgYmxvY2suc25hcHNob3QuaWQsIGVycik7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgc2V0U3RhdHVzKCdkb25lJyk7XG4gICAgICBzZXRSZXN1bHQoeyB0cmFuc2Zvcm1lZCwgZmFpbGVkLCBlcnJvcnMgfSk7XG4gICAgICBpZiAoZmFpbGVkID09PSAwKSB7XG4gICAgICAgIHNldE1lc3NhZ2UoYERvbmUhIEluc2VydGVkICR7dHJhbnNmb3JtZWR9IGRpYWdyYW0ocykuYCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXRNZXNzYWdlKGBEb25lLiAke3RyYW5zZm9ybWVkfSBpbnNlcnRlZCwgJHtmYWlsZWR9IGZhaWxlZC5gKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHNldFN0YXR1cygnZXJyb3InKTtcbiAgICAgIHNldE1lc3NhZ2UoZXJyIGluc3RhbmNlb2YgRXJyb3IgPyBlcnIubWVzc2FnZSA6ICdGYWlsZWQgdG8gc2NhbiBkb2N1bWVudCcpO1xuICAgICAgY29uc29sZS5lcnJvcignW01lcm1haWRdIFRyYW5zZm9ybSBlcnJvcjonLCBlcnIpO1xuICAgIH1cbiAgfSwgW10pO1xuXG4gIHJldHVybiB7IHN0YXR1cywgbWVzc2FnZSwgcmVzdWx0LCB0cmFuc2Zvcm0gfTtcbn1cbiIsImltcG9ydCB7IHVzZUVmZmVjdCwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyB1c2VUcmFuc2Zvcm1lciB9IGZyb20gJy4vaG9va3MvdXNlVHJhbnNmb3JtZXInO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBBcHAoKSB7XG4gIGNvbnN0IHsgc3RhdHVzLCBtZXNzYWdlLCByZXN1bHQsIHRyYW5zZm9ybSB9ID0gdXNlVHJhbnNmb3JtZXIoKTtcbiAgY29uc3QgW3JlbW92ZUNvZGUsIHNldFJlbW92ZUNvZGVdID0gdXNlU3RhdGUoZmFsc2UpO1xuXG4gIC8vIEF1dG8tdHJhbnNmb3JtIG9uIG1vdW50XG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgdHJhbnNmb3JtKGZhbHNlKTtcbiAgfSwgW3RyYW5zZm9ybV0pO1xuXG4gIGNvbnN0IGlzV29ya2luZyA9IHN0YXR1cyA9PT0gJ3NjYW5uaW5nJyB8fCBzdGF0dXMgPT09ICd0cmFuc2Zvcm1pbmcnO1xuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJwYW5lbFwiPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJwYW5lbC1oZWFkZXJcIj5cbiAgICAgICAgPHN2ZyB3aWR0aD1cIjIwXCIgaGVpZ2h0PVwiMjBcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCIjNjM2NmYxXCIgc3Ryb2tlV2lkdGg9XCIyXCIgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiPlxuICAgICAgICAgIDxyZWN0IHg9XCIzXCIgeT1cIjNcIiB3aWR0aD1cIjdcIiBoZWlnaHQ9XCI3XCIgLz5cbiAgICAgICAgICA8cmVjdCB4PVwiMTRcIiB5PVwiM1wiIHdpZHRoPVwiN1wiIGhlaWdodD1cIjdcIiAvPlxuICAgICAgICAgIDxyZWN0IHg9XCIxNFwiIHk9XCIxNFwiIHdpZHRoPVwiN1wiIGhlaWdodD1cIjdcIiAvPlxuICAgICAgICAgIDxyZWN0IHg9XCIzXCIgeT1cIjE0XCIgd2lkdGg9XCI3XCIgaGVpZ2h0PVwiN1wiIC8+XG4gICAgICAgIDwvc3ZnPlxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJwYW5lbC10aXRsZVwiPk1lcm1haWQgVHJhbnNmb3JtZXI8L3NwYW4+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJwYW5lbC1ib2R5XCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgc3RhdHVzICR7c3RhdHVzfWB9PlxuICAgICAgICAgIHtpc1dvcmtpbmcgJiYgPHNwYW4gY2xhc3NOYW1lPVwic3Bpbm5lclwiIC8+fVxuICAgICAgICAgIDxzcGFuPnttZXNzYWdlfTwvc3Bhbj5cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAge3Jlc3VsdCAmJiByZXN1bHQuZXJyb3JzLmxlbmd0aCA+IDAgJiYgKFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZXJyb3JzXCI+XG4gICAgICAgICAgICB7cmVzdWx0LmVycm9ycy5tYXAoKGVyciwgaSkgPT4gKFxuICAgICAgICAgICAgICA8ZGl2IGtleT17aX0gY2xhc3NOYW1lPVwiZXJyb3ItaXRlbVwiPntlcnJ9PC9kaXY+XG4gICAgICAgICAgICApKX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKX1cblxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFjdGlvbnNcIj5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwiY2hlY2tib3gtbGFiZWxcIj5cbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICB0eXBlPVwiY2hlY2tib3hcIlxuICAgICAgICAgICAgICBjaGVja2VkPXtyZW1vdmVDb2RlfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IHNldFJlbW92ZUNvZGUoZS50YXJnZXQuY2hlY2tlZCl9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgUmVtb3ZlIGNvZGUgYmxvY2tzIGFmdGVyIHRyYW5zZm9ybWluZ1xuICAgICAgICAgIDwvbGFiZWw+XG5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ0cmFuc2Zvcm0tYnRuXCJcbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHRyYW5zZm9ybShyZW1vdmVDb2RlKX1cbiAgICAgICAgICAgIGRpc2FibGVkPXtpc1dvcmtpbmd9XG4gICAgICAgICAgPlxuICAgICAgICAgICAge2lzV29ya2luZyA/ICdUcmFuc2Zvcm1pbmcuLi4nIDogc3RhdHVzID09PSAnZG9uZScgPyAnVHJhbnNmb3JtIEFnYWluJyA6ICdUcmFuc2Zvcm0nfVxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICApO1xufVxuIiwiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBSZWFjdERPTSBmcm9tICdyZWFjdC1kb20nO1xuaW1wb3J0IEFwcCBmcm9tICcuL0FwcCc7XG5pbXBvcnQgJy4vaW5kZXguY3NzJztcblxuUmVhY3RET00ucmVuZGVyKFxuICA8UmVhY3QuU3RyaWN0TW9kZT5cbiAgICA8QXBwIC8+XG4gIDwvUmVhY3QuU3RyaWN0TW9kZT4sXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyb290JykgYXMgSFRNTEVsZW1lbnRcbik7XG4iXSwibmFtZXMiOlsicmVzdWx0Il0sInNvdXJjZVJvb3QiOiIifQ==