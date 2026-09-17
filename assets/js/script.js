$(function () {
    if (typeof gsap === "undefined") {
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    var lenis = null;

    if (typeof Lenis !== "undefined") {
        lenis = new Lenis({
            duration: 1.2,
            smoothWheel: true
        });

        lenis.on("scroll", ScrollTrigger.update);

        gsap.ticker.add(function (time) {
            lenis.raf(time * 1000);
        });

        gsap.ticker.lagSmoothing(0);
    }

    var headerEl = document.querySelector(".kv-header");
    var menuToggle = document.querySelector(".menu-toggle");
    var menuOverlay = document.querySelector(".menu-overlay");
    var mobileMenu = document.querySelector("#mobile-menu");
    var menuOpen = false;
    var lockedScrollY = 0;
    var lastScrollY = 0;
    var headerHidden = false;

    function scrollToSection(target) {
        if (!target) {
            return;
        }

        if (lenis) {
            lenis.scrollTo(target, {
                offset: 0,
                duration: 1.2
            });
            return;
        }

        target.scrollIntoView({
            behavior: "smooth"
        });
    }

    function lockScroll() {
        if (lenis) {
            lenis.stop();
            return;
        }

        lockedScrollY = window.scrollY;
        document.body.style.position = "fixed";
        document.body.style.top = "-" + lockedScrollY + "px";
        document.body.style.left = "0";
        document.body.style.right = "0";
        document.body.style.width = "100%";
    }

    function unlockScroll() {
        if (lenis) {
            lenis.start();
            return;
        }

        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.width = "";
        window.scrollTo(0, lockedScrollY);
    }

    function openMenu() {
        if (menuOpen || !mobileMenu) {
            return;
        }

        menuOpen = true;
        document.body.classList.add("menu-open");

        if (headerEl) {
            headerEl.classList.add("menu-open");
            gsap.to(headerEl, {
                yPercent: 0,
                duration: 0.25,
                overwrite: true
            });
            headerHidden = false;
        }

        if (menuToggle) {
            menuToggle.classList.add("is-open");
            menuToggle.setAttribute("aria-expanded", "true");
            menuToggle.setAttribute("aria-label", "硫붾돱 ?リ린");
        }

        mobileMenu.setAttribute("aria-hidden", "false");
        mobileMenu.removeAttribute("inert");
        lockScroll();

        gsap.to(menuOverlay, {
            autoAlpha: 1,
            duration: 0.4,
            ease: "power2.out"
        });

        gsap.to(mobileMenu, {
            xPercent: 0,
            duration: 0.5,
            ease: "power3.out"
        });

        var firstLink = mobileMenu.querySelector("a");

        if (firstLink) {
            firstLink.focus();
        }
    }

    function closeMenu(onClosed) {
        if (!menuOpen || !mobileMenu) {
            if (typeof onClosed === "function") {
                onClosed();
            }
            return;
        }

        menuOpen = false;
        document.body.classList.remove("menu-open");

        if (headerEl) {
            headerEl.classList.remove("menu-open");
        }

        if (menuToggle) {
            menuToggle.classList.remove("is-open");
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "硫붾돱 ?닿린");
        }

        mobileMenu.setAttribute("aria-hidden", "true");
        mobileMenu.setAttribute("inert", "");

        gsap.to(menuOverlay, {
            autoAlpha: 0,
            duration: 0.35,
            ease: "power2.out"
        });

        gsap.to(mobileMenu, {
            xPercent: 100,
            duration: 0.45,
            ease: "power3.inOut",
            onComplete: function () {
                unlockScroll();

                if (typeof onClosed === "function") {
                    onClosed();
                }
            }
        });

        if (menuToggle && typeof onClosed !== "function") {
            menuToggle.focus();
        }
    }

    if (mobileMenu) {
        gsap.set(mobileMenu, {
            xPercent: 100
        });
        mobileMenu.setAttribute("inert", "");
    }

    if (menuOverlay) {
        gsap.set(menuOverlay, {
            autoAlpha: 0
        });
    }

    if (menuToggle) {
        menuToggle.addEventListener("click", function () {
            if (menuOpen) {
                closeMenu();
            } else {
                openMenu();
            }
        });
    }

    if (menuOverlay) {
        menuOverlay.addEventListener("click", function () {
            closeMenu();
        });
    }

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && menuOpen) {
            closeMenu();
        }
    });

    $(".kv-nav a, .mobile-menu a").on("click", function (event) {
        var href = this.getAttribute("href");
        var target;

        if (!href || href.charAt(0) !== "#") {
            return;
        }

        event.preventDefault();
        target = document.querySelector(href);

        if (!target) {
            return;
        }

        if (menuOpen) {
            closeMenu(function () {
                scrollToSection(target);
            });
            return;
        }

        scrollToSection(target);
    });

    function updateHeaderByScroll(currentY) {
        if (!headerEl || menuOpen) {
            return;
        }

        if (currentY <= 40) {
            if (headerHidden) {
                gsap.to(headerEl, {
                    yPercent: 0,
                    duration: 0.35,
                    ease: "power2.out",
                    overwrite: true
                });
                headerHidden = false;
            }
            lastScrollY = currentY;
            return;
        }

        if (currentY > lastScrollY + 8) {
            if (!headerHidden) {
                gsap.to(headerEl, {
                    yPercent: -100,
                    duration: 0.35,
                    ease: "power2.out",
                    overwrite: true
                });
                headerHidden = true;
            }
        } else if (currentY < lastScrollY - 8) {
            if (headerHidden) {
                gsap.to(headerEl, {
                    yPercent: 0,
                    duration: 0.35,
                    ease: "power2.out",
                    overwrite: true
                });
                headerHidden = false;
            }
        }

        lastScrollY = currentY;
    }

    if (lenis) {
        lenis.on("scroll", function (event) {
            updateHeaderByScroll(event.scroll);
        });
    } else {
        $(window).on("scroll", function () {
            updateHeaderByScroll($(window).scrollTop());
        });
    }

    gsap.fromTo(".kv-light-line", {
        y: "-100%"
    }, {
        y: "100%",
        duration: 5,
        ease: "power3.out",
        repeat: -1
    });

    gsap.timeline({
        defaults: {
            ease: "power3.out"
        }
    })
        .fromTo(
            ".hanja",
            { opacity: 0, clipPath: "inset(0 0 100% 0)" },
            { opacity: 0.22, clipPath: "inset(0 0 0% 0)", duration: 1.2, ease: "power2.out" }
        )
        .fromTo(
            ".developer",
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6 },
            "-=0.5"
        )
        .fromTo(
            ".eng-name",
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 0.8 }
        )
        .fromTo(
            ".main-copy",
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.8, delay: 0.2 }
        )
        .fromTo(
            ".copy-desc",
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.7, delay: 0.35 }
        );

    var bodyEl = document.body;
    var htmlEl = document.documentElement;
    var startBgColor = "#111";
    var endBgColor = "#f4f7fb";
    var kvBgColor = "#02030A";
    var startBgImage = window.getComputedStyle(bodyEl).backgroundImage;

    ScrollTrigger.create({
        trigger: ".skill-sec",
        start: "top bottom",
        end: "top 75%",
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: function (self) {
            var color = gsap.utils.interpolate(startBgColor, endBgColor, self.progress);

            bodyEl.style.backgroundColor = color;
            htmlEl.style.backgroundColor = color;

            if (self.progress <= 0) {
                bodyEl.style.backgroundImage = startBgImage;
                htmlEl.style.backgroundImage = startBgImage;
            } else {
                bodyEl.style.backgroundImage = "none";
                htmlEl.style.backgroundImage = "none";
            }
        }
    });

    ScrollTrigger.create({
        trigger: ".project-sec",
        start: "top bottom",
        end: "top 75%",
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: function (self) {
            var color = gsap.utils.interpolate(endBgColor, kvBgColor, self.progress);

            bodyEl.style.backgroundColor = color;
            htmlEl.style.backgroundColor = color;

            if (self.progress >= 1) {
                bodyEl.style.backgroundColor = kvBgColor;
                htmlEl.style.backgroundColor = kvBgColor;
                bodyEl.style.backgroundImage = startBgImage;
                htmlEl.style.backgroundImage = startBgImage;
            } else {
                bodyEl.style.backgroundImage = "none";
                htmlEl.style.backgroundImage = "none";
            }
        }
    });

    gsap.to(".education-sec .subtitle", {
        color: "#2B6CB0",
        ease: "none",
        scrollTrigger: {
            trigger: ".skill-sec",
            start: "top bottom",
            end: "top 75%",
            scrub: true
        }
    });

    gsap.to(".education-sec .title", {
        color: "#0D1B2A",
        ease: "none",
        scrollTrigger: {
            trigger: ".skill-sec",
            start: "top bottom",
            end: "top 75%",
            scrub: true
        }
    });

    gsap.to(".education-sec .edu-list li, .education-sec .cert-list li", {
        color: "#3D4F63",
        ease: "none",
        scrollTrigger: {
            trigger: ".skill-sec",
            start: "top bottom",
            end: "top 75%",
            scrub: true
        }
    });

    var profileImg = document.querySelector(".education-sec img");
    var aboutWrap = document.querySelector(".about-wrap");
    var profileStart = { x: 0, y: 0 };
    var $skillWrap = $(".skill-wrap");

    if ($skillWrap.length) {
        $skillWrap.find(".percent").each(function () {
            var $percent = $(this);
            var target = parseInt($percent.text(), 10);

            if (isNaN(target)) {
                return;
            }

            $percent.attr("data-percent", target);
            $percent.text("0%");
        });

        ScrollTrigger.create({
            trigger: $skillWrap[0],
            start: "top 60%",
            once: true,
            onEnter: function () {
                $skillWrap.addClass("is-progress");

                $skillWrap.find(".percent").each(function () {
                    var percentEl = this;
                    var $percent = $(percentEl);
                    var target = parseInt($percent.attr("data-percent"), 10);
                    var delay = 0;
                    var barEl = $percent.closest("li").find(".progress-bar2")[0];
                    var counter = { value: 0 };

                    if (isNaN(target)) {
                        return;
                    }

                    if (barEl) {
                        delay = parseFloat(window.getComputedStyle(barEl).animationDelay) || 0;
                    }

                    gsap.to(counter, {
                        value: target,
                        duration: 1.5,
                        delay: delay,
                        ease: "power1.out",
                        onUpdate: function () {
                            percentEl.textContent = Math.round(counter.value) + "%";
                        }
                    });
                });
            }
        });
    }

    var mm = gsap.matchMedia();

    mm.add({
        isDesktop: "(min-width: 1025px)",
        isTablet: "(min-width: 768px) and (max-width: 1024px)",
        isMobile: "(max-width: 767px)"
    }, function (context) {
        var isDesktop = context.conditions.isDesktop;
        var isTablet = context.conditions.isTablet;
        var yLarge = isDesktop ? 80 : isTablet ? 50 : 30;
        var yMid = isDesktop ? 50 : isTablet ? 36 : 24;
        var fadeDuration = isDesktop ? 1 : 0.75;

        function fadeUp(selector, y, start, duration) {
            gsap.utils.toArray(selector).forEach(function (element) {
                gsap.fromTo(element, {
                    opacity: 0,
                    y: y
                }, {
                    opacity: 1,
                    y: 0,
                    duration: duration || fadeDuration,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: element,
                        start: start
                    }
                });
            });
        }

        fadeUp(".about-sec .subtitle, .about-sec .title, .about-sec .point-text, .about-sec .desc", yLarge, "top 55%");
        fadeUp(".skill-sec .subtitle, .skill-sec .title", yLarge, "top 75%");
        fadeUp(".project-sec .subtitle, .project-sec .title, .project-sec .desc", yLarge, "top 60%");
        fadeUp(".merit-sec .sub-title, .merit-sec .title, .merit-sec .desc", yLarge, "top 75%");

        gsap.utils.toArray(".project-item").forEach(function (item) {
            var parts = item.querySelectorAll(".project-number, .project-name, .project-category, .project-copy, .project-meta, .project-cta, .project-visual");

            gsap.fromTo(parts, {
                opacity: 0,
                y: yMid
            }, {
                opacity: 1,
                y: 0,
                duration: isDesktop ? 0.7 : 0.55,
                stagger: isDesktop ? 0.08 : 0.05,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: item,
                    start: "top 60%"
                }
            });
        });

        gsap.fromTo(".merit-list > li", {
            opacity: 0,
            y: yMid
        }, {
            opacity: 1,
            y: 0,
            duration: isDesktop ? 0.7 : 0.55,
            stagger: isDesktop ? 0.1 : 0.06,
            ease: "power2.out",
            scrollTrigger: {
                trigger: ".merit-list",
                start: "top 80%"
            }
        });

        gsap.fromTo(
            gsap.utils.toArray(".contact-label, .contact-title, .contact-description, .contact-cta, .contact-email, .contact-phone, .contact-github"),
            {
                opacity: 0,
                y: yMid
            },
            {
                opacity: 1,
                y: 0,
                duration: isDesktop ? 0.9 : 0.65,
                stagger: isDesktop ? 0.12 : 0.08,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: ".contact-sec",
                    start: "top 60%",
                    toggleActions: "play reverse play reverse"
                }
            }
        );

        function updateProfileStart() {
            if (!isDesktop || !profileImg || !aboutWrap) {
                return;
            }

            gsap.set(profileImg, { x: 0, y: 0, scale: 1 });

            var imgRect = profileImg.getBoundingClientRect();
            var textRight = 0;
            var textTop = Infinity;
            var textBottom = -Infinity;
            var nodes = aboutWrap.children;
            var i;
            var rect;

            for (i = 0; i < nodes.length; i++) {
                rect = nodes[i].getBoundingClientRect();
                textRight = Math.max(textRight, rect.right);
                textTop = Math.min(textTop, rect.top);
                textBottom = Math.max(textBottom, rect.bottom);
            }

            var gap = 48;
            var startLeft = textRight + gap;
            var startTop = textTop + (textBottom - textTop - imgRect.height) / 2;

            profileStart.x = startLeft - imgRect.left - 700;
            profileStart.y = startTop - imgRect.top - 70;
        }

        if (isDesktop && profileImg) {
            updateProfileStart();
            ScrollTrigger.addEventListener("refreshInit", updateProfileStart);

            gsap.fromTo(profileImg, {
                x: function () {
                    return profileStart.x;
                },
                y: function () {
                    return profileStart.y;
                },
                scale: 0.8
            }, {
                x: 0,
                y: 0,
                scale: 1,
                ease: "none",
                immediateRender: true,
                scrollTrigger: {
                    trigger: ".about-sec",
                    start: "top top",
                    endTrigger: ".education-sec",
                    end: "top top",
                    scrub: true,
                    invalidateOnRefresh: true
                }
            });
        } else if (profileImg) {
            gsap.set(profileImg, { x: 0, y: 0, scale: 1, clearProps: "transform" });
        }

        var $handImg = $(".hand-img");
        var $aboutSec = $(".about-sec");

        if (isDesktop && $handImg.length && $aboutSec.length) {
            var handOriginTop = parseFloat(window.getComputedStyle($handImg[0]).top) || 50;
            var handImgStopGap = 300;

            gsap.fromTo($handImg, {
                top: handOriginTop
            }, {
                top: function () {
                    return $aboutSec[0].offsetHeight - $handImg.outerHeight() - handImgStopGap;
                },
                ease: "none",
                immediateRender: false,
                scrollTrigger: {
                    trigger: $handImg[0],
                    start: "top 150px",
                    end: function () {
                        var maxTop = $aboutSec[0].offsetHeight - $handImg.outerHeight() - handImgStopGap;
                        return "+=" + Math.max(0, maxTop - handOriginTop);
                    },
                    scrub: true,
                    invalidateOnRefresh: true,
                    onEnter: function () {
                        $handImg.addClass("is-dimmed");
                    },
                    onLeaveBack: function () {
                        $handImg.removeClass("is-dimmed");
                    }
                }
            });
        }

        return function () {
            ScrollTrigger.removeEventListener("refreshInit", updateProfileStart);

            if (profileImg) {
                gsap.set(profileImg, { x: 0, y: 0, scale: 1 });
            }
        };
    });

    var resizeTimer = null;

    window.addEventListener("resize", function () {
        if (window.innerWidth > 1024 && menuOpen) {
            closeMenu();
        }

        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            ScrollTrigger.refresh();
        }, 200);
    });

    window.addEventListener("load", function () {
        ScrollTrigger.refresh();
    });
});
