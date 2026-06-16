(function () {
  "use strict";

  const WHATSAPP_NUMBER = "905309690689";

  const MODAL_TITLES = {
    "sik-kullanilanlar": "Sık Kullanılanlar",
    "rezervasyonlarim": "Rezervasyonlarım",
    "kvkk": "KVKK Aydınlatma Metni",
    "kira-sozlesmesi": "Kira Sözleşmesi",
    "kampanyalar": "Kampanyalarımız",
  };

  /* ---- Mobile Navigation ---- */
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");

  function closeMobileNav() {
    if (!navLinks || !navToggle) return;
    navLinks.classList.remove("open");
    navToggle.classList.remove("active");
    navToggle.setAttribute("aria-expanded", "false");
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      navToggle.classList.toggle("active", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMobileNav);
    });
  }

  /* ---- Header Scroll Effect ---- */
  const header = document.querySelector(".site-header");
  if (header) {
    window.addEventListener("scroll", () => {
      header.classList.toggle("scrolled", window.scrollY > 10);
    });
  }

  /* ---- Modal System ---- */
  const modalOverlay = document.getElementById("modalOverlay");
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");
  const modalClose = document.querySelector(".modal-close");

  function openModal(modalId) {
    const template = document.getElementById("tpl-" + modalId);
    if (!template || !modalOverlay || !modalTitle || !modalBody) return;

    modalTitle.textContent = MODAL_TITLES[modalId] || "Bilgi";
    modalBody.innerHTML = "";
    modalBody.appendChild(template.content.cloneNode(true));

    modalOverlay.classList.add("active");
    modalOverlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    const scrollBtn = modalBody.querySelector(".modal-scroll-reserve");
    if (scrollBtn) {
      scrollBtn.addEventListener("click", () => closeModal());
    }
  }

  function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove("active");
    modalOverlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  document.querySelectorAll("[data-modal]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const modalId = trigger.getAttribute("data-modal");
      closeMobileNav();
      openModal(modalId);
    });
  });

  if (modalClose) modalClose.addEventListener("click", closeModal);

  if (modalOverlay) {
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  /* ---- Flatpickr Datepickers ---- */
  const pickupInput = document.getElementById("pickupDate");
  const returnInput = document.getElementById("returnDate");
  let returnPicker = null;

  if (pickupInput && returnInput && typeof flatpickr !== "undefined") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    flatpickr(pickupInput, {
      locale: "tr",
      dateFormat: "d.m.Y",
      minDate: "today",
      disableMobile: false,
      onChange: function (selectedDates) {
        if (selectedDates.length > 0 && returnPicker) {
          const nextDay = new Date(selectedDates[0]);
          nextDay.setDate(nextDay.getDate() + 1);
          returnPicker.set("minDate", nextDay);

          const returnDate = returnPicker.selectedDates[0];
          if (returnDate && returnDate <= selectedDates[0]) {
            returnPicker.clear();
          }
        }
      },
    });

    returnPicker = flatpickr(returnInput, {
      locale: "tr",
      dateFormat: "d.m.Y",
      minDate: new Date(today.getTime() + 86400000),
      disableMobile: false,
    });
  }

  /* ---- Fleet Card → Reservation ---- */
  const vehicleSelect = document.getElementById("vehicle");
  const reservationSection = document.getElementById("rezervasyon");

  document.querySelectorAll("[data-reserve]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const vehicleName = btn.getAttribute("data-reserve");

      if (vehicleSelect) {
        vehicleSelect.value = vehicleName;
        vehicleSelect.dispatchEvent(new Event("change"));
      }

      if (reservationSection) {
        reservationSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      setTimeout(() => {
        if (vehicleSelect) {
          vehicleSelect.focus();
          vehicleSelect.classList.add("highlight");
          setTimeout(() => vehicleSelect.classList.remove("highlight"), 1500);
        }
      }, 600);
    });
  });

  /* ---- WhatsApp Form Submission ---- */
  const reservationForm = document.getElementById("reservationForm");

  if (reservationForm) {
    reservationForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const fields = {
        vehicle: document.getElementById("vehicle"),
        pickupOffice: document.getElementById("pickupOffice"),
        pickupDate: document.getElementById("pickupDate"),
        returnDate: document.getElementById("returnDate"),
        fullName: document.getElementById("fullName"),
        phone: document.getElementById("phone"),
      };

      let isValid = true;

      Object.values(fields).forEach((field) => {
        if (!field) return;
        field.classList.remove("error");
        if (!field.value.trim()) {
          field.classList.add("error");
          isValid = false;
        }
      });

      if (!isValid) {
        reservationForm.querySelector(".error")?.focus();
        return;
      }

      const message = buildWhatsAppMessage({
        vehicle: fields.vehicle.value,
        pickupDate: fields.pickupDate.value,
        returnDate: fields.returnDate.value,
        fullName: fields.fullName.value.trim(),
        phone: fields.phone.value.trim(),
      });

      window.open(
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
        "_blank"
      );
    });
  }

  function buildWhatsAppMessage(data) {
    return `Sayın Yetkili, Mecar Group web sitesi üzerinden yeni bir VIP rezervasyon talebi oluşturuldu. Araç: ${data.vehicle}, Alış Tarihi: ${data.pickupDate}, İade Tarihi: ${data.returnDate}, Müşteri: ${data.fullName}, Telefon: ${data.phone}`;
  }

  /* ---- FAQ Accordion ---- */
  const accordionItems = document.querySelectorAll(".accordion-item");

  accordionItems.forEach((item) => {
    const trigger = item.querySelector(".accordion-trigger");
    if (!trigger) return;

    trigger.addEventListener("click", () => {
      const isActive = item.classList.contains("active");

      accordionItems.forEach((other) => {
        other.classList.remove("active");
        other.querySelector(".accordion-trigger")?.setAttribute("aria-expanded", "false");
      });

      if (!isActive) {
        item.classList.add("active");
        trigger.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---- Reviews Slider ---- */
  const reviewsTrack = document.getElementById("reviewsTrack");
  const reviewsDots = document.getElementById("reviewsDots");
  const prevBtn = document.querySelector(".reviews-nav--prev");
  const nextBtn = document.querySelector(".reviews-nav--next");

  if (reviewsTrack && reviewsDots) {
    const cards = reviewsTrack.querySelectorAll(".review-card");
    let currentIndex = 0;
    let autoSlideInterval = null;

    cards.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.classList.add("reviews-dot");
      dot.setAttribute("aria-label", `Yorum ${i + 1}`);
      if (i === 0) dot.classList.add("active");
      dot.addEventListener("click", () => goToSlide(i));
      reviewsDots.appendChild(dot);
    });

    const dots = reviewsDots.querySelectorAll(".reviews-dot");

    function getScrollAmount() {
      const card = cards[0];
      return card ? card.offsetWidth + 20 : 0;
    }

    function goToSlide(index) {
      currentIndex = Math.max(0, Math.min(index, cards.length - 1));
      reviewsTrack.scrollTo({ left: currentIndex * getScrollAmount(), behavior: "smooth" });
      dots.forEach((dot, i) => dot.classList.toggle("active", i === currentIndex));
    }

    function nextSlide() {
      goToSlide(currentIndex >= cards.length - 1 ? 0 : currentIndex + 1);
    }

    function prevSlide() {
      goToSlide(currentIndex <= 0 ? cards.length - 1 : currentIndex - 1);
    }

    prevBtn?.addEventListener("click", prevSlide);
    nextBtn?.addEventListener("click", nextSlide);

    reviewsTrack.addEventListener("scroll", () => {
      const amount = getScrollAmount();
      if (amount) {
        currentIndex = Math.round(reviewsTrack.scrollLeft / amount);
        dots.forEach((dot, i) => dot.classList.toggle("active", i === currentIndex));
      }
    });

    function startAutoSlide() { autoSlideInterval = setInterval(nextSlide, 5000); }
    function stopAutoSlide() { if (autoSlideInterval) clearInterval(autoSlideInterval); }

    reviewsTrack.addEventListener("mouseenter", stopAutoSlide);
    reviewsTrack.addEventListener("mouseleave", startAutoSlide);
    reviewsTrack.addEventListener("touchstart", stopAutoSlide, { passive: true });
    reviewsTrack.addEventListener("touchend", startAutoSlide);

    startAutoSlide();
  }

  /* ---- Hero Car 360° Rotation (CSS + JS) ---- */
  const heroStage = document.getElementById("heroCarStage");
  const heroCarImg = document.getElementById("heroCarImg");

  if (heroStage && heroCarImg) {
    let rotationY = 0;
    let mouseX = 0;
    let mouseY = 0;
    let isHovering = false;
    const rotationSpeed = 0.35;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function applyCarTransform() {
      const hoverOffsetX = isHovering ? mouseX * 12 : 0;
      const hoverOffsetY = isHovering ? -mouseY * 6 : 0;
      const scale = isHovering ? 1.05 : 1.02;

      if (!prefersReducedMotion) {
        rotationY = (rotationY + rotationSpeed) % 360;
      }

      heroCarImg.style.transform = `rotateY(${rotationY + hoverOffsetX}deg) rotateX(${hoverOffsetY}deg) scale(${scale})`;
    }

    if (!prefersReducedMotion) {
      (function animate() {
        applyCarTransform();
        requestAnimationFrame(animate);
      })();
    }

    if (window.matchMedia("(min-width: 768px)").matches) {
      heroStage.addEventListener("mouseenter", () => { isHovering = true; });
      heroStage.addEventListener("mouseleave", () => {
        isHovering = false;
        mouseX = 0;
        mouseY = 0;
      });

      heroStage.addEventListener("mousemove", (e) => {
        const rect = heroStage.getBoundingClientRect();
        mouseX = (e.clientX - rect.left) / rect.width - 0.5;
        mouseY = (e.clientY - rect.top) / rect.height - 0.5;
      });
    }
  }
})();
