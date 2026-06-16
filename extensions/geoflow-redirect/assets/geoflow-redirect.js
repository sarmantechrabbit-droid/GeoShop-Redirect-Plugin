(function () {
  var ROOT_ID = "geoflow-redirect-root";
  var IP_API_URLS = [
    {
      url: "https://ipapi.co/json/",
      getCountryCode: function (data) {
        return data.country_code;
      },
    },
    {
      url: "https://ipwho.is/",
      getCountryCode: function (data) {
        return data.country_code;
      },
    },
    {
      url: "https://ipinfo.io/json",
      getCountryCode: function (data) {
        return data.country;
      },
    },
  ];

  // Detect Shopify Theme Editor mode
  var isThemeEditor = !!(window.Shopify && window.Shopify.designMode);

  var DEFAULT_SETTINGS = {
    popupEnabled: true,
    indiaUrl: "https://india.example.com/",
    uaeUrl: "https://uae.example.com/",
    indiaMessage:
      "We detected that you are visiting from India. Please shop from our Indian website.",
    uaeMessage:
      "We detected that you are visiting from UAE. Please shop from our UAE website.",
    otherCountryMessage: "Choose your shopping region.",
    indiaButtonText: "Shop India",
    uaeButtonText: "Shop UAE",
    shopNowButtonText: "Shop Now",
    rememberSelection: true,
  };

  var COUNTRIES = {
    IN: {
      code: "IN",
      label: "India",
      flagClass: "gfr-flag--in",
      urlKey: "indiaUrl",
      messageKey: "indiaMessage",
      buttonKey: "indiaButtonText",
    },
    AE: {
      code: "AE",
      label: "UAE",
      flagClass: "gfr-flag--ae",
      urlKey: "uaeUrl",
      messageKey: "uaeMessage",
      buttonKey: "uaeButtonText",
    },
  };

  var settings = DEFAULT_SETTINGS;

  console.log("[GeoFlow] Redirect loaded");
  console.log("[GeoFlow] Theme editor mode:", isThemeEditor);

  function mergeSettings(remoteSettings) {
    settings = Object.assign({}, DEFAULT_SETTINGS, remoteSettings || {});
  }

  function getSettingsUrl() {
    var config = window.GeoFlowRedirect || {};
    return config.settingsUrl;
  }

  function saveCountry(countryCode) {
    if (!settings.rememberSelection) {
      return;
    }

    try {
      window.localStorage.setItem("geoflow_redirect_selected_country", countryCode);
    } catch (error) {
      return;
    }
  }

  // Safe redirect helper — blocks redirects inside Theme Editor iframe
  function redirectTo(url) {
    if (!url) return;

    console.log("[GeoFlow] Redirect URL:", url);

    if (isThemeEditor) {
      console.log("[GeoFlow] Redirect blocked in theme editor:", url);
      alert(
        "Preview mode: Redirect is disabled inside Shopify Theme Editor.\n\nTarget URL: " +
          url +
          "\n\nOpen the storefront directly to test redirect.",
      );
      return;
    }

    if (url.replace(/\/$/, "") === window.location.href.replace(/\/$/, "")) {
      console.log("[GeoFlow] Already on target URL, redirect skipped.");
      return;
    }

    window.top.location.href = url;
  }

  function removePopup() {
    var existingRoot = document.getElementById(ROOT_ID);
    if (existingRoot) {
      existingRoot.remove();
    }
  }

  function redirectToCountry(countryCode) {
    var country = COUNTRIES[countryCode];
    if (!country) {
      return;
    }

    saveCountry(countryCode);
    redirectTo(settings[country.urlKey]);
  }

  function createButton(label, className) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.textContent = label;
    return button;
  }

  function createFlag(country, sizeClass) {
    var flag = document.createElement("span");
    flag.className = sizeClass + " " + country.flagClass;
    flag.setAttribute("aria-label", country.label + " flag");
    flag.setAttribute("role", "img");
    return flag;
  }

  function createOption(countryCode) {
    var country = COUNTRIES[countryCode];
    var option = createButton("", "gfr-option");

    var content = document.createElement("span");
    content.className = "gfr-option-content";

    var flag = createFlag(country, "gfr-flag");

    var copy = document.createElement("span");
    var label = document.createElement("span");
    label.className = "gfr-country";
    label.textContent = country.label;

    var url = document.createElement("span");
    url.className = "gfr-url";
    url.textContent = settings[country.urlKey];

    copy.appendChild(label);
    copy.appendChild(url);
    content.appendChild(flag);
    content.appendChild(copy);
    option.appendChild(content);

    option.addEventListener("click", function () {
      redirectToCountry(countryCode);
    });

    return option;
  }

  function createManualContent() {
    var wrapper = document.createElement("div");
    var message = document.createElement("p");
    message.className = "gfr-message";
    message.textContent =
      "Select the storefront that best matches your shopping region.";

    var options = document.createElement("div");
    options.className = "gfr-options";
    options.appendChild(createOption("IN"));
    options.appendChild(createOption("AE"));

    wrapper.appendChild(message);
    wrapper.appendChild(options);

    return wrapper;
  }

  function renderPopup(countryCode) {
    removePopup();

    var root = document.createElement("div");
    root.id = ROOT_ID;

    var overlay = document.createElement("div");
    overlay.className = "gfr-overlay";
    overlay.setAttribute("role", "presentation");

    var modal = document.createElement("section");
    modal.className = "gfr-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "gfr-title");

    var kicker = document.createElement("p");
    kicker.className = "gfr-kicker";
    kicker.textContent = "GeoFlow Redirect";

    var title = document.createElement("h2");
    title.id = "gfr-title";
    title.className = "gfr-title";
    title.textContent = settings.otherCountryMessage;

    modal.appendChild(kicker);
    modal.appendChild(title);
    modal.appendChild(createManualContent());

    overlay.appendChild(modal);
    root.appendChild(overlay);
    document.body.appendChild(root);
  }

  function normalizeDetectedCountry(countryCode) {
    countryCode = String(countryCode || "").toUpperCase();

    return countryCode === "IN" || countryCode === "AE" ? countryCode : "";
  }

  function detectCountryFromService(serviceIndex) {
    var service = IP_API_URLS[serviceIndex];

    if (!service) {
      return Promise.resolve("OTHER");
    }

    return fetch(service.url, { headers: { Accept: "application/json" } })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Country detection failed.");
        }
        return response.json();
      })
      .then(function (data) {
        var countryCode = normalizeDetectedCountry(service.getCountryCode(data));

        console.log(
          "[GeoFlow] Detected country from " + service.url + ":",
          countryCode || "OTHER",
        );

        return countryCode || "OTHER";
      })
      .catch(function (error) {
        console.warn(
          "[GeoFlow] Country detection failed from " + service.url + ":",
          error.message || error,
        );
        return detectCountryFromService(serviceIndex + 1);
      });
  }

  function detectCountry() {
    // Skip IP detection in Theme Editor to avoid unnecessary API calls
    if (isThemeEditor) {
      console.log(
        "[GeoFlow] Skipping IP detection in theme editor, showing manual picker",
      );
      return Promise.resolve("OTHER");
    }

    return detectCountryFromService(0);
  }

  function startPopupFlow() {
    if (!settings.popupEnabled) {
      console.log("[GeoFlow] Popup is disabled in settings");
      return;
    }

    // In Theme Editor, always show the popup for preview purposes
    if (isThemeEditor) {
      console.log("[GeoFlow] Theme editor: always showing popup for preview");
      renderPopup("OTHER");
      return;
    }

    detectCountry().then(function (countryCode) {
      if (countryCode === "IN" || countryCode === "AE") {
        redirectToCountry(countryCode);
        return;
      }

      renderPopup("OTHER");
    });
  }

  function loadSettings() {
    var settingsUrl = getSettingsUrl();

    if (!settingsUrl) {
      console.warn(
        "[GeoFlow] No settings URL found. Make sure the app embed is enabled.",
      );
      mergeSettings(null);
      startPopupFlow();
      return;
    }

    if (
      settingsUrl.indexOf("https://example.com") === 0 ||
      settingsUrl.indexOf("https://localhost") === 0 ||
      settingsUrl.indexOf("http://localhost") === 0
    ) {
      console.warn(
        "[GeoFlow] App URL is still set to a placeholder (" +
          settingsUrl.split("/api")[0] +
          '). Please update the App URL in Theme Editor > App Embeds > GeoFlow Redirect to your actual app URL (the Cloudflare tunnel URL from "npm run dev").',
      );
      mergeSettings(null);
      startPopupFlow();
      return;
    }

    console.log("[GeoFlow] Fetching settings from:", settingsUrl);

    fetch(settingsUrl, { headers: { Accept: "application/json" } })
      .then(function (response) {
        if (!response.ok) {
          throw new Error(
            "Settings request failed with status " + response.status,
          );
        }
        return response.json();
      })
      .then(function (payload) {
        console.log(
          "[GeoFlow] Settings loaded successfully:",
          payload.settings,
        );
        mergeSettings(payload.settings);
        startPopupFlow();
      })
      .catch(function (err) {
        console.error(
          "[GeoFlow] Failed to load settings from: " + settingsUrl,
          err.message || err,
        );
        console.warn(
          "[GeoFlow] Using default settings as fallback. The popup URLs may be incorrect.",
        );
        mergeSettings(null);
        startPopupFlow();
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadSettings);
  } else {
    loadSettings();
  }
})();
