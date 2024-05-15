"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
self["webpackHotUpdate_N_E"]("_app-pages-browser_src_app_components_Globe_tsx",{

/***/ "(app-pages-browser)/./src/app/components/Globe.tsx":
/*!**************************************!*\
  !*** ./src/app/components/Globe.tsx ***!
  \**************************************/
/***/ (function(module, __webpack_exports__, __webpack_require__) {

eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"(app-pages-browser)/./node_modules/next/dist/compiled/react/jsx-dev-runtime.js\");\n/* harmony import */ var styled_jsx_style__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! styled-jsx/style */ \"(app-pages-browser)/./node_modules/styled-jsx/style.js\");\n/* harmony import */ var styled_jsx_style__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(styled_jsx_style__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react */ \"(app-pages-browser)/./node_modules/next/dist/compiled/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _amcharts_amcharts5__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @amcharts/amcharts5 */ \"(app-pages-browser)/./node_modules/@amcharts/amcharts5/.internal/core/Root.js\");\n/* harmony import */ var _amcharts_amcharts5__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @amcharts/amcharts5 */ \"(app-pages-browser)/./node_modules/@amcharts/amcharts5/.internal/core/util/Color.js\");\n/* harmony import */ var _amcharts_amcharts5__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @amcharts/amcharts5 */ \"(app-pages-browser)/./node_modules/@amcharts/amcharts5/.internal/core/util/Ease.js\");\n/* harmony import */ var _amcharts_amcharts5_map__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @amcharts/amcharts5/map */ \"(app-pages-browser)/./node_modules/@amcharts/amcharts5/.internal/charts/map/MapChart.js\");\n/* harmony import */ var _amcharts_amcharts5_map__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @amcharts/amcharts5/map */ \"(app-pages-browser)/./node_modules/d3-geo/src/projection/orthographic.js\");\n/* harmony import */ var _amcharts_amcharts5_map__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @amcharts/amcharts5/map */ \"(app-pages-browser)/./node_modules/@amcharts/amcharts5/.internal/charts/map/MapPolygonSeries.js\");\n/* harmony import */ var _amcharts_amcharts5_geodata_worldLow__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @amcharts/amcharts5-geodata/worldLow */ \"(app-pages-browser)/./node_modules/@amcharts/amcharts5-geodata/worldLow.js\");\n/* harmony import */ var _amcharts_amcharts5_themes_Animated__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @amcharts/amcharts5/themes/Animated */ \"(app-pages-browser)/./node_modules/@amcharts/amcharts5/themes/Animated.js\");\n/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! axios */ \"(app-pages-browser)/./node_modules/axios/lib/axios.js\");\n/* __next_internal_client_entry_do_not_use__ default auto */ \nvar _s = $RefreshSig$();\n\n\n\n\n\n\n\nconst Globe = (param)=>{\n    let { geojsonUrl } = param;\n    _s();\n    const chartRef = (0,react__WEBPACK_IMPORTED_MODULE_2__.useRef)(null);\n    const [isClient, setIsClient] = (0,react__WEBPACK_IMPORTED_MODULE_2__.useState)(false);\n    const [articleContent, setArticleContent] = (0,react__WEBPACK_IMPORTED_MODULE_2__.useState)(\"\");\n    (0,react__WEBPACK_IMPORTED_MODULE_2__.useEffect)(()=>{\n        setIsClient(true);\n    }, []);\n    (0,react__WEBPACK_IMPORTED_MODULE_2__.useLayoutEffect)(()=>{\n        if (!isClient) return;\n        const root = _amcharts_amcharts5__WEBPACK_IMPORTED_MODULE_4__.Root.new(\"chartdiv\");\n        root.setThemes([\n            _amcharts_amcharts5_themes_Animated__WEBPACK_IMPORTED_MODULE_5__[\"default\"].new(root)\n        ]);\n        const chart = root.container.children.push(_amcharts_amcharts5_map__WEBPACK_IMPORTED_MODULE_6__.MapChart.new(root, {\n            panX: \"rotateX\",\n            panY: \"rotateY\",\n            projection: _amcharts_amcharts5_map__WEBPACK_IMPORTED_MODULE_7__[\"default\"]()\n        }));\n        const polygonSeries = chart.series.push(_amcharts_amcharts5_map__WEBPACK_IMPORTED_MODULE_8__.MapPolygonSeries.new(root, {\n            geoJSON: _amcharts_amcharts5_geodata_worldLow__WEBPACK_IMPORTED_MODULE_3__[\"default\"]\n        }));\n        fetch(geojsonUrl).then((response)=>response.json()).then((data)=>{\n            chart.series.push(_amcharts_amcharts5_map__WEBPACK_IMPORTED_MODULE_8__.MapPolygonSeries.new(root, {\n                geoJSON: data\n            }));\n        }).catch((error)=>console.error(\"Error fetching GeoJSON data:\", error));\n        polygonSeries.mapPolygons.template.setAll({\n            tooltipText: \"{name}\",\n            toggleKey: \"active\",\n            interactive: true\n        });\n        polygonSeries.mapPolygons.template.states.create(\"hover\", {\n            fill: _amcharts_amcharts5__WEBPACK_IMPORTED_MODULE_9__.color(0x677935)\n        });\n        polygonSeries.mapPolygons.template.states.create(\"active\", {\n            fill: _amcharts_amcharts5__WEBPACK_IMPORTED_MODULE_9__.color(0x677935)\n        });\n        let previousPolygon = null;\n        polygonSeries.mapPolygons.template.on(\"active\", async (active, target)=>{\n            if (previousPolygon && previousPolygon !== target) {\n                previousPolygon.set(\"active\", false);\n            }\n            if (target.get(\"active\")) {\n                const centroid = target.geoCentroid();\n                if (centroid) {\n                    chart.animate({\n                        key: \"rotationX\",\n                        to: -centroid.longitude,\n                        duration: 1500,\n                        easing: _amcharts_amcharts5__WEBPACK_IMPORTED_MODULE_10__.inOut(_amcharts_amcharts5__WEBPACK_IMPORTED_MODULE_10__.cubic)\n                    });\n                    chart.animate({\n                        key: \"rotationY\",\n                        to: -centroid.latitude,\n                        duration: 1500,\n                        easing: _amcharts_amcharts5__WEBPACK_IMPORTED_MODULE_10__.inOut(_amcharts_amcharts5__WEBPACK_IMPORTED_MODULE_10__.cubic)\n                    });\n                }\n                const countryName = target.dataItem.dataContext.name;\n                const content = await fetchWikipediaContent(countryName);\n                setArticleContent(content);\n            }\n            previousPolygon = target;\n        });\n        chartRef.current = root;\n        return ()=>{\n            root.dispose();\n        };\n    }, [\n        geojsonUrl,\n        isClient\n    ]);\n    const fetchTavilySearchResults = async (query)=>{\n        const apiKey = \"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\"; // Replace with your actual API key\n        const payload = {\n            api_key: apiKey,\n            query: query,\n            search_depth: \"basic\",\n            include_answer: false,\n            include_images: true,\n            include_raw_content: false,\n            max_results: 5,\n            include_domains: [],\n            exclude_domains: []\n        };\n        try {\n            const response = await axios__WEBPACK_IMPORTED_MODULE_11__[\"default\"].post(\"https://api.tavily.com/search\", payload);\n            console.log(response.data);\n        // Handle the response as needed, e.g., update state with the results\n        } catch (error) {\n            console.error(\"Error fetching search results:\", error);\n        }\n    };\n    if (!isClient) return null;\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n        className: \"jsx-7ed44e15f3367c7b\" + \" \" + \"relative\",\n        children: [\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                id: \"chartdiv\",\n                style: {\n                    width: \"100%\",\n                    height: \"500px\"\n                },\n                className: \"jsx-7ed44e15f3367c7b\" + \" \" + \"\"\n            }, void 0, false, {\n                fileName: \"/root/open-politics/open_politics_project/frontend/next-generation-interface/src/app/components/Globe.tsx\",\n                lineNumber: 124,\n                columnNumber: 7\n            }, undefined),\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                id: \"articleWindow\",\n                className: \"jsx-7ed44e15f3367c7b\" + \" \" + \"fixed bottom-5 right-5 w-64 h-3/4 bg-gray-800 bg-opacity-20 rounded-lg p-4 text-green-400 shadow-lg overflow-hidden\",\n                children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                    dangerouslySetInnerHTML: {\n                        __html: articleContent\n                    },\n                    className: \"jsx-7ed44e15f3367c7b\" + \" \" + \"inner-content h-full overflow-auto pr-4\"\n                }, void 0, false, {\n                    fileName: \"/root/open-politics/open_politics_project/frontend/next-generation-interface/src/app/components/Globe.tsx\",\n                    lineNumber: 126,\n                    columnNumber: 9\n                }, undefined)\n            }, void 0, false, {\n                fileName: \"/root/open-politics/open_politics_project/frontend/next-generation-interface/src/app/components/Globe.tsx\",\n                lineNumber: 125,\n                columnNumber: 7\n            }, undefined),\n            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)((styled_jsx_style__WEBPACK_IMPORTED_MODULE_1___default()), {\n                id: \"7ed44e15f3367c7b\",\n                children: \".inner-content.jsx-7ed44e15f3367c7b::-webkit-scrollbar{width:0;height:0}.inner-content.jsx-7ed44e15f3367c7b{-ms-overflow-style:none;scrollbar-width:none}\"\n            }, void 0, false, void 0, undefined)\n        ]\n    }, void 0, true, {\n        fileName: \"/root/open-politics/open_politics_project/frontend/next-generation-interface/src/app/components/Globe.tsx\",\n        lineNumber: 123,\n        columnNumber: 5\n    }, undefined);\n};\n_s(Globe, \"ENAHYZIBbQIfvxGUIc2Hx8lMzgQ=\");\n_c = Globe;\nconst fetchWikipediaContent = async (countryName)=>{\n    try {\n        const response = await fetch(\"https://en.wikipedia.org/api/rest_v1/page/summary/\".concat(countryName));\n        const data = await response.json();\n        return data.extract ? \"<div><strong>\".concat(countryName, \"</strong><br>'\").concat(data.extract, \"</div>\") : \"<div><strong>\".concat(countryName, \"</strong>: No information available.</div>\");\n    } catch (error) {\n        console.error(\"Error fetching Wikipedia content:\", error);\n        return \"<div><strong>\".concat(countryName, \"</strong>: Error fetching information.</div>\");\n    }\n};\n/* harmony default export */ __webpack_exports__[\"default\"] = (Globe);\nvar _c;\n$RefreshReg$(_c, \"Globe\");\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwcC1wYWdlcy1icm93c2VyKS8uL3NyYy9hcHAvY29tcG9uZW50cy9HbG9iZS50c3giLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRTRFO0FBQ2pDO0FBQ087QUFDcUI7QUFDRjtBQUMzQztBQU0xQixNQUFNVSxRQUE4QjtRQUFDLEVBQUVDLFVBQVUsRUFBRTs7SUFDakQsTUFBTUMsV0FBV1YsNkNBQU1BLENBQWtCO0lBQ3pDLE1BQU0sQ0FBQ1csVUFBVUMsWUFBWSxHQUFHWCwrQ0FBUUEsQ0FBQztJQUN6QyxNQUFNLENBQUNZLGdCQUFnQkMsa0JBQWtCLEdBQUdiLCtDQUFRQSxDQUFTO0lBRTdEQyxnREFBU0EsQ0FBQztRQUNSVSxZQUFZO0lBQ2QsR0FBRyxFQUFFO0lBRUxiLHNEQUFlQSxDQUFDO1FBQ2QsSUFBSSxDQUFDWSxVQUFVO1FBRWYsTUFBTUksT0FBT1oscURBQVEsQ0FBQ2MsR0FBRyxDQUFDO1FBRTFCRixLQUFLRyxTQUFTLENBQUM7WUFBQ1osMkVBQWtCQSxDQUFDVyxHQUFHLENBQUNGO1NBQU07UUFFN0MsTUFBTUksUUFBUUosS0FBS0ssU0FBUyxDQUFDQyxRQUFRLENBQUNDLElBQUksQ0FDeENsQiw2REFBZSxDQUFDYSxHQUFHLENBQUNGLE1BQU07WUFDeEJTLE1BQU07WUFDTkMsTUFBTTtZQUNOQyxZQUFZdEIsK0RBQXNCO1FBQ3BDO1FBR0YsTUFBTXdCLGdCQUFnQlQsTUFBTVUsTUFBTSxDQUFDUCxJQUFJLENBQ3JDbEIscUVBQXVCLENBQUNhLEdBQUcsQ0FBQ0YsTUFBTTtZQUNoQ2dCLFNBQVMxQiw0RUFBbUJBO1FBQzlCO1FBR0YyQixNQUFNdkIsWUFDSHdCLElBQUksQ0FBQ0MsQ0FBQUEsV0FBWUEsU0FBU0MsSUFBSSxJQUM5QkYsSUFBSSxDQUFDRyxDQUFBQTtZQUNKakIsTUFBTVUsTUFBTSxDQUFDUCxJQUFJLENBQ2ZsQixxRUFBdUIsQ0FBQ2EsR0FBRyxDQUFDRixNQUFNO2dCQUNoQ2dCLFNBQVNLO1lBQ1g7UUFFSixH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Z0JBQTRDN0QsT0FBNUJnQyxhQUFZLGtCQUE2QixPQUFiaEMsS0FBSzZELE9BQU8sRUFBQyxZQUFVLGdCQUE0QixPQUFaN0IsYUFBWTtJQUN2SCxFQUFFLE9BQU85QixPQUFPO1FBQ2RDLFFBQVFELEtBQUssQ0FBQyxxQ0FBcUNBO1FBQ25ELE9BQU8sZ0JBQTRCLE9BQVo4QixhQUFZO0lBQ3JDO0FBQ0Y7QUFFQSwrREFBZTVELEtBQUtBLEVBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9fTl9FLy4vc3JjL2FwcC9jb21wb25lbnRzL0dsb2JlLnRzeD84YTE3Il0sInNvdXJjZXNDb250ZW50IjpbIlwidXNlIGNsaWVudFwiO1xuXG5pbXBvcnQgUmVhY3QsIHsgdXNlTGF5b3V0RWZmZWN0LCB1c2VSZWYsIHVzZVN0YXRlLCB1c2VFZmZlY3QgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgKiBhcyBhbTUgZnJvbSBcIkBhbWNoYXJ0cy9hbWNoYXJ0czVcIjtcbmltcG9ydCAqIGFzIGFtNW1hcCBmcm9tIFwiQGFtY2hhcnRzL2FtY2hhcnRzNS9tYXBcIjtcbmltcG9ydCBhbTVnZW9kYXRhX3dvcmxkTG93IGZyb20gXCJAYW1jaGFydHMvYW1jaGFydHM1LWdlb2RhdGEvd29ybGRMb3dcIjtcbmltcG9ydCBhbTV0aGVtZXNfQW5pbWF0ZWQgZnJvbSBcIkBhbWNoYXJ0cy9hbWNoYXJ0czUvdGhlbWVzL0FuaW1hdGVkXCI7XG5pbXBvcnQgYXhpb3MgZnJvbSAnYXhpb3MnO1xuXG5pbnRlcmZhY2UgR2xvYmVQcm9wcyB7XG4gIGdlb2pzb25Vcmw6IHN0cmluZztcbn1cblxuY29uc3QgR2xvYmU6IFJlYWN0LkZDPEdsb2JlUHJvcHM+ID0gKHsgZ2VvanNvblVybCB9KSA9PiB7XG4gIGNvbnN0IGNoYXJ0UmVmID0gdXNlUmVmPGFtNS5Sb290IHwgbnVsbD4obnVsbCk7XG4gIGNvbnN0IFtpc0NsaWVudCwgc2V0SXNDbGllbnRdID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbYXJ0aWNsZUNvbnRlbnQsIHNldEFydGljbGVDb250ZW50XSA9IHVzZVN0YXRlPHN0cmluZz4oJycpO1xuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgc2V0SXNDbGllbnQodHJ1ZSk7XG4gIH0sIFtdKTtcblxuICB1c2VMYXlvdXRFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghaXNDbGllbnQpIHJldHVybjtcblxuICAgIGNvbnN0IHJvb3QgPSBhbTUuUm9vdC5uZXcoXCJjaGFydGRpdlwiKTtcblxuICAgIHJvb3Quc2V0VGhlbWVzKFthbTV0aGVtZXNfQW5pbWF0ZWQubmV3KHJvb3QpXSk7XG5cbiAgICBjb25zdCBjaGFydCA9IHJvb3QuY29udGFpbmVyLmNoaWxkcmVuLnB1c2goXG4gICAgICBhbTVtYXAuTWFwQ2hhcnQubmV3KHJvb3QsIHtcbiAgICAgICAgcGFuWDogXCJyb3RhdGVYXCIsXG4gICAgICAgIHBhblk6IFwicm90YXRlWVwiLFxuICAgICAgICBwcm9qZWN0aW9uOiBhbTVtYXAuZ2VvT3J0aG9ncmFwaGljKClcbiAgICAgIH0pXG4gICAgKTtcblxuICAgIGNvbnN0IHBvbHlnb25TZXJpZXMgPSBjaGFydC5zZXJpZXMucHVzaChcbiAgICAgIGFtNW1hcC5NYXBQb2x5Z29uU2VyaWVzLm5ldyhyb290LCB7XG4gICAgICAgIGdlb0pTT046IGFtNWdlb2RhdGFfd29ybGRMb3dcbiAgICAgIH0pXG4gICAgKTtcblxuICAgIGZldGNoKGdlb2pzb25VcmwpXG4gICAgICAudGhlbihyZXNwb25zZSA9PiByZXNwb25zZS5qc29uKCkpXG4gICAgICAudGhlbihkYXRhID0+IHtcbiAgICAgICAgY2hhcnQuc2VyaWVzLnB1c2goXG4gICAgICAgICAgYW01bWFwLk1hcFBvbHlnb25TZXJpZXMubmV3KHJvb3QsIHtcbiAgICAgICAgICAgIGdlb0pTT046IGRhdGFcbiAgICAgICAgICB9KVxuICAgICAgICApO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChlcnJvciA9PiBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyBHZW9KU09OIGRhdGE6JywgZXJyb3IpKTtcblxuICAgIHBvbHlnb25TZXJpZXMubWFwUG9seWdvbnMudGVtcGxhdGUuc2V0QWxsKHtcbiAgICAgIHRvb2x0aXBUZXh0OiBcIntuYW1lfVwiLFxuICAgICAgdG9nZ2xlS2V5OiBcImFjdGl2ZVwiLFxuICAgICAgaW50ZXJhY3RpdmU6IHRydWVcbiAgICB9KTtcblxuICAgIHBvbHlnb25TZXJpZXMubWFwUG9seWdvbnMudGVtcGxhdGUuc3RhdGVzLmNyZWF0ZShcImhvdmVyXCIsIHtcbiAgICAgIGZpbGw6IGFtNS5jb2xvcigweDY3NzkzNSlcbiAgICB9KTtcblxuICAgIHBvbHlnb25TZXJpZXMubWFwUG9seWdvbnMudGVtcGxhdGUuc3RhdGVzLmNyZWF0ZShcImFjdGl2ZVwiLCB7XG4gICAgICBmaWxsOiBhbTUuY29sb3IoMHg2Nzc5MzUpXG4gICAgfSk7XG5cbiAgICBsZXQgcHJldmlvdXNQb2x5Z29uOiBhbTVtYXAuTWFwUG9seWdvbiB8IG51bGwgPSBudWxsO1xuXG4gICAgcG9seWdvblNlcmllcy5tYXBQb2x5Z29ucy50ZW1wbGF0ZS5vbihcImFjdGl2ZVwiLCBhc3luYyAoYWN0aXZlLCB0YXJnZXQpID0+IHtcbiAgICAgIGlmIChwcmV2aW91c1BvbHlnb24gJiYgcHJldmlvdXNQb2x5Z29uICE9PSB0YXJnZXQpIHtcbiAgICAgICAgcHJldmlvdXNQb2x5Z29uLnNldChcImFjdGl2ZVwiLCBmYWxzZSk7XG4gICAgICB9XG4gICAgICBpZiAodGFyZ2V0LmdldChcImFjdGl2ZVwiKSkge1xuICAgICAgICBjb25zdCBjZW50cm9pZCA9IHRhcmdldC5nZW9DZW50cm9pZCgpO1xuICAgICAgICBpZiAoY2VudHJvaWQpIHtcbiAgICAgICAgICBjaGFydC5hbmltYXRlKHsga2V5OiBcInJvdGF0aW9uWFwiLCB0bzogLWNlbnRyb2lkLmxvbmdpdHVkZSwgZHVyYXRpb246IDE1MDAsIGVhc2luZzogYW01LmVhc2UuaW5PdXQoYW01LmVhc2UuY3ViaWMpIH0pO1xuICAgICAgICAgIGNoYXJ0LmFuaW1hdGUoeyBrZXk6IFwicm90YXRpb25ZXCIsIHRvOiAtY2VudHJvaWQubGF0aXR1ZGUsIGR1cmF0aW9uOiAxNTAwLCBlYXNpbmc6IGFtNS5lYXNlLmluT3V0KGFtNS5lYXNlLmN1YmljKSB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNvdW50cnlOYW1lID0gdGFyZ2V0LmRhdGFJdGVtLmRhdGFDb250ZXh0Lm5hbWU7XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSBhd2FpdCBmZXRjaFdpa2lwZWRpYUNvbnRlbnQoY291bnRyeU5hbWUpO1xuXG4gICAgICAgIHNldEFydGljbGVDb250ZW50KGNvbnRlbnQpO1xuICAgICAgfVxuICAgICAgcHJldmlvdXNQb2x5Z29uID0gdGFyZ2V0O1xuICAgIH0pO1xuXG4gICAgY2hhcnRSZWYuY3VycmVudCA9IHJvb3Q7XG5cbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgcm9vdC5kaXNwb3NlKCk7XG4gICAgfTtcbiAgfSwgW2dlb2pzb25VcmwsIGlzQ2xpZW50XSk7XG5cbiAgY29uc3QgZmV0Y2hUYXZpbHlTZWFyY2hSZXN1bHRzID0gYXN5bmMgKHF1ZXJ5OiBzdHJpbmcpID0+IHtcbiAgICBjb25zdCBhcGlLZXkgPSBcInR2bHktRXpMQnZPYUhacEE2RG5KOTVoRmE1RDhLUFg2eUNZVklcIjsgLy8gUmVwbGFjZSB3aXRoIHlvdXIgYWN0dWFsIEFQSSBrZXlcbiAgICBjb25zdCBwYXlsb2FkID0ge1xuICAgICAgYXBpX2tleTogYXBpS2V5LFxuICAgICAgcXVlcnk6IHF1ZXJ5LFxuICAgICAgc2VhcmNoX2RlcHRoOiBcImJhc2ljXCIsXG4gICAgICBpbmNsdWRlX2Fuc3dlcjogZmFsc2UsXG4gICAgICBpbmNsdWRlX2ltYWdlczogdHJ1ZSxcbiAgICAgIGluY2x1ZGVfcmF3X2NvbnRlbnQ6IGZhbHNlLFxuICAgICAgbWF4X3Jlc3VsdHM6IDUsXG4gICAgICBpbmNsdWRlX2RvbWFpbnM6IFtdLFxuICAgICAgZXhjbHVkZV9kb21haW5zOiBbXVxuICAgIH07XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBheGlvcy5wb3N0KCdodHRwczovL2FwaS50YXZpbHkuY29tL3NlYXJjaCcsIHBheWxvYWQpO1xuICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UuZGF0YSk7XG4gICAgICAvLyBIYW5kbGUgdGhlIHJlc3BvbnNlIGFzIG5lZWRlZCwgZS5nLiwgdXBkYXRlIHN0YXRlIHdpdGggdGhlIHJlc3VsdHNcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgc2VhcmNoIHJlc3VsdHM6JywgZXJyb3IpO1xuICAgIH1cbiAgfTtcblxuICBpZiAoIWlzQ2xpZW50KSByZXR1cm4gbnVsbDtcblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwicmVsYXRpdmVcIj5cbiAgICAgIDxkaXYgaWQ9XCJjaGFydGRpdlwiIGNsYXNzTmFtZT1cIlwiIHN0eWxlPXt7IHdpZHRoOiBcIjEwMCVcIiwgaGVpZ2h0OiBcIjUwMHB4XCIgfX0+PC9kaXY+XG4gICAgICA8ZGl2IGlkPVwiYXJ0aWNsZVdpbmRvd1wiIGNsYXNzTmFtZT1cImZpeGVkIGJvdHRvbS01IHJpZ2h0LTUgdy02NCBoLTMvNCBiZy1ncmF5LTgwMCBiZy1vcGFjaXR5LTIwIHJvdW5kZWQtbGcgcC00IHRleHQtZ3JlZW4tNDAwIHNoYWRvdy1sZyBvdmVyZmxvdy1oaWRkZW5cIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJpbm5lci1jb250ZW50IGgtZnVsbCBvdmVyZmxvdy1hdXRvIHByLTRcIiBkYW5nZXJvdXNseVNldElubmVySFRNTD17eyBfX2h0bWw6IGFydGljbGVDb250ZW50IH19IC8+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxzdHlsZSBqc3g+e2BcbiAgICAgICAgLmlubmVyLWNvbnRlbnQ6Oi13ZWJraXQtc2Nyb2xsYmFyIHtcbiAgICAgICAgICB3aWR0aDogMDtcbiAgICAgICAgICBoZWlnaHQ6IDA7XG4gICAgICAgIH1cbiAgICAgICAgLmlubmVyLWNvbnRlbnQge1xuICAgICAgICAgIC1tcy1vdmVyZmxvdy1zdHlsZTogbm9uZTsgIC8qIElFIGFuZCBFZGdlICovXG4gICAgICAgICAgc2Nyb2xsYmFyLXdpZHRoOiBub25lOyAgLyogRmlyZWZveCAqL1xuICAgICAgICB9XG4gICAgICBgfTwvc3R5bGU+XG4gICAgPC9kaXY+XG4gICk7XG59O1xuXG5jb25zdCBmZXRjaFdpa2lwZWRpYUNvbnRlbnQgPSBhc3luYyAoY291bnRyeU5hbWU6IHN0cmluZykgPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy9hcGkvcmVzdF92MS9wYWdlL3N1bW1hcnkvJHtjb3VudHJ5TmFtZX1gKTtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgIHJldHVybiBkYXRhLmV4dHJhY3QgPyBgPGRpdj48c3Ryb25nPiR7Y291bnRyeU5hbWV9PC9zdHJvbmc+PGJyPicke2RhdGEuZXh0cmFjdH08L2Rpdj5gIDogYDxkaXY+PHN0cm9uZz4ke2NvdW50cnlOYW1lfTwvc3Ryb25nPjogTm8gaW5mb3JtYXRpb24gYXZhaWxhYmxlLjwvZGl2PmA7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgV2lraXBlZGlhIGNvbnRlbnQ6JywgZXJyb3IpO1xuICAgIHJldHVybiBgPGRpdj48c3Ryb25nPiR7Y291bnRyeU5hbWV9PC9zdHJvbmc+OiBFcnJvciBmZXRjaGluZyBpbmZvcm1hdGlvbi48L2Rpdj5gO1xuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBHbG9iZTtcbiJdLCJuYW1lcyI6WyJSZWFjdCIsInVzZUxheW91dEVmZmVjdCIsInVzZVJlZiIsInVzZVN0YXRlIiwidXNlRWZmZWN0IiwiYW01IiwiYW01bWFwIiwiYW01Z2VvZGF0YV93b3JsZExvdyIsImFtNXRoZW1lc19BbmltYXRlZCIsImF4aW9zIiwiR2xvYmUiLCJnZW9qc29uVXJsIiwiY2hhcnRSZWYiLCJpc0NsaWVudCIsInNldElzQ2xpZW50IiwiYXJ0aWNsZUNvbnRlbnQiLCJzZXRBcnRpY2xlQ29udGVudCIsInJvb3QiLCJSb290IiwibmV3Iiwic2V0VGhlbWVzIiwiY2hhcnQiLCJjb250YWluZXIiLCJjaGlsZHJlbiIsInB1c2giLCJNYXBDaGFydCIsInBhblgiLCJwYW5ZIiwicHJvamVjdGlvbiIsImdlb09ydGhvZ3JhcGhpYyIsInBvbHlnb25TZXJpZXMiLCJzZXJpZXMiLCJNYXBQb2x5Z29uU2VyaWVzIiwiZ2VvSlNPTiIsImZldGNoIiwidGhlbiIsInJlc3BvbnNlIiwianNvbiIsImRhdGEiLCJjYXRjaCIsImVycm9yIiwiY29uc29sZSIsIm1hcFBvbHlnb25zIiwidGVtcGxhdGUiLCJzZXRBbGwiLCJ0b29sdGlwVGV4dCIsInRvZ2dsZUtleSIsImludGVyYWN0aXZlIiwic3RhdGVzIiwiY3JlYXRlIiwiZmlsbCIsImNvbG9yIiwicHJldmlvdXNQb2x5Z29uIiwib24iLCJhY3RpdmUiLCJ0YXJnZXQiLCJzZXQiLCJnZXQiLCJjZW50cm9pZCIsImdlb0NlbnRyb2lkIiwiYW5pbWF0ZSIsImtleSIsInRvIiwibG9uZ2l0dWRlIiwiZHVyYXRpb24iLCJlYXNpbmciLCJlYXNlIiwiaW5PdXQiLCJjdWJpYyIsImxhdGl0dWRlIiwiY291bnRyeU5hbWUiLCJkYXRhSXRlbSIsImRhdGFDb250ZXh0IiwibmFtZSIsImNvbnRlbnQiLCJmZXRjaFdpa2lwZWRpYUNvbnRlbnQiLCJjdXJyZW50IiwiZGlzcG9zZSIsImZldGNoVGF2aWx5U2VhcmNoUmVzdWx0cyIsInF1ZXJ5IiwiYXBpS2V5IiwicGF5bG9hZCIsImFwaV9rZXkiLCJzZWFyY2hfZGVwdGgiLCJpbmNsdWRlX2Fuc3dlciIsImluY2x1ZGVfaW1hZ2VzIiwiaW5jbHVkZV9yYXdfY29udGVudCIsIm1heF9yZXN1bHRzIiwiaW5jbHVkZV9kb21haW5zIiwiZXhjbHVkZV9kb21haW5zIiwicG9zdCIsImxvZyIsImRpdiIsImlkIiwic3R5bGUiLCJ3aWR0aCIsImhlaWdodCIsImRhbmdlcm91c2x5U2V0SW5uZXJIVE1MIiwiX19odG1sIiwiZXh0cmFjdCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(app-pages-browser)/./src/app/components/Globe.tsx\n"));

/***/ })

});