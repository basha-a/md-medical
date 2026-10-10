/* MD Medical Agencies — site interactions */
(function () {
    "use strict";

    // Navbar: add a solid background once the page is scrolled
    var nav = document.querySelector(".site-nav");
    if (nav) {
        var onScroll = function () {
            nav.classList.toggle("is-scrolled", window.scrollY > 8);
        };
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
    }

    // Hero: gentle mouse parallax on desktop (skipped for touch and reduced motion)
    var parallax = document.querySelector("[data-parallax]");
    if (parallax && window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)").matches) {
        var layers = parallax.querySelectorAll("[data-depth]");
        var hero = parallax.closest("section") || parallax;
        var frame = null;
        var move = function (x, y) {
            layers.forEach(function (layer) {
                var depth = parseFloat(layer.getAttribute("data-depth"));
                layer.style.translate = (x * depth).toFixed(1) + "px " + (y * depth).toFixed(1) + "px";
            });
        };
        hero.addEventListener("pointermove", function (e) {
            var rect = hero.getBoundingClientRect();
            var x = (e.clientX - rect.left) / rect.width - 0.5;
            var y = (e.clientY - rect.top) / rect.height - 0.5;
            if (frame) cancelAnimationFrame(frame);
            frame = requestAnimationFrame(function () { move(x, y); });
        });
        hero.addEventListener("pointerleave", function () { move(0, 0); });
    }

    // Reveal-on-scroll animations
    var revealEls = document.querySelectorAll("[data-reveal]");
    if ("IntersectionObserver" in window) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
        revealEls.forEach(function (el) { observer.observe(el); });
    } else {
        revealEls.forEach(function (el) { el.classList.add("is-visible"); });
    }

    // Brand logos are hotlinked from other sites; drop any tile whose image fails
    document.querySelectorAll(".brand-tile img").forEach(function (img) {
        var drop = function () { img.closest(".brand-tile").remove(); };
        if (img.complete && img.naturalWidth === 0) drop();
        else img.addEventListener("error", drop);
    });

    // Footer year
    document.querySelectorAll("[data-year]").forEach(function (el) {
        el.textContent = new Date().getFullYear();
    });

    // Products: category filter
    var filterBtns = document.querySelectorAll("[data-filter]");
    var productItems = document.querySelectorAll(".product-item");
    filterBtns.forEach(function (btn) {
        btn.addEventListener("click", function () {
            var filter = btn.getAttribute("data-filter");
            filterBtns.forEach(function (b) {
                b.classList.toggle("active", b === btn);
                b.setAttribute("aria-pressed", b === btn ? "true" : "false");
            });
            productItems.forEach(function (item) {
                var show = filter === "all" || item.getAttribute("data-category") === filter;
                item.classList.toggle("is-hidden", !show);
            });
        });
    });

    // Contact: pre-select enquiry type from ?type=... in the URL
    var form = document.getElementById("contactForm");
    if (form) {
        var params = new URLSearchParams(window.location.search);
        var typeSelect = form.querySelector("#enquiryType");
        var product = params.get("product");
        if (params.get("type") && typeSelect) typeSelect.value = params.get("type");
        if (product) form.querySelector("#message").value = "I would like to enquire about: " + product;

        // No backend: validate, then hand the message to the visitor's email app
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            if (!form.checkValidity()) {
                form.classList.add("was-validated");
                return;
            }
            var name = form.querySelector("#fullName").value.trim();
            var phone = form.querySelector("#phone").value.trim();
            var email = form.querySelector("#email").value.trim();
            var type = typeSelect.value;
            var message = form.querySelector("#message").value.trim();

            var body = "Name: " + name + "\nPhone: " + phone + "\nEmail: " + email +
                "\nEnquiry type: " + type + "\n\n" + message;
            window.location.href = "mailto:mdmedicalagencies31@gmail.com" +
                "?subject=" + encodeURIComponent(type + " enquiry from " + name) +
                "&body=" + encodeURIComponent(body);

            document.getElementById("formSuccess").classList.remove("d-none");
            form.reset();
            form.classList.remove("was-validated");
        });
    }
})();
