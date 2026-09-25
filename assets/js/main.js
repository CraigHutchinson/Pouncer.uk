/* Pouncer marketing site — progressive enhancement only.
   The page is fully readable with this file blocked. */

(function () {
  "use strict";

  // ---------------------------------------------------------------------------
  // WhatsApp contact number, international format, digits only, no "+" and no
  // spaces — for example "447700900123" for a UK mobile.
  //
  // Leave it empty and the WhatsApp option stays hidden everywhere, so the site
  // never ships a dead link. Set it and the option appears on the reserve page.
  // ---------------------------------------------------------------------------
  var WHATSAPP_NUMBER = "";

  // Mobile navigation.
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    nav.addEventListener("click", function (event) {
      if (event.target.tagName === "A") {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // WhatsApp channel: revealed only when a number is configured above.
  var waChannel = document.getElementById("whatsapp-channel");
  var waLink = document.getElementById("whatsapp-link");

  if (waChannel && waLink) {
    var digits = WHATSAPP_NUMBER.replace(/[^0-9]/g, "");
    if (digits) {
      waLink.href = "https://wa.me/" + digits + "?text=" +
        encodeURIComponent("Hi — please let me know when Pouncer is ready.");
      waLink.rel = "noopener";
      waChannel.hidden = false;
    }
  }

  // Signup form.
  //
  // `data-endpoint` on the form is intentionally empty: no mailing-list provider
  // is wired up yet. Until one is, the form composes a mail message instead of
  // pretending an address was stored. Set data-endpoint to a POST URL that
  // accepts {"email": "..."} to switch behaviour — see website/README.md.
  var form = document.getElementById("signup-form");
  var status = document.getElementById("form-status");

  if (!form || !status) {
    return;
  }

  var LIST_ADDRESS = "hello@pouncer.uk";

  function setStatus(message, isError) {
    status.textContent = message;
    status.classList.toggle("is-error", Boolean(isError));
  }

  function looksLikeEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var field = form.querySelector("input[name='email']");
    var email = field ? field.value.trim() : "";

    if (!looksLikeEmail(email)) {
      setStatus("That does not look like an email address — check and try again.", true);
      if (field) { field.focus(); }
      return;
    }

    var endpoint = form.getAttribute("data-endpoint");

    if (!endpoint) {
      setStatus("Opening your mail app — send the message to request launch updates.");
      window.location.href =
        "mailto:" + LIST_ADDRESS +
        "?subject=" + encodeURIComponent("Pouncer launch updates") +
        "&body=" + encodeURIComponent("Please add " + email + " to the Pouncer update list.");
      return;
    }

    setStatus("Adding you…");

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email })
    })
      .then(function (response) {
        if (!response.ok) { throw new Error("Request failed: " + response.status); }
        form.reset();
        setStatus("You are on the list. We only mail when there is something real to show.");
      })
      .catch(function () {
        setStatus("That did not go through. Email " + LIST_ADDRESS + " and we will add you.", true);
      });
  });
})();
