// ===================================
// SA VIDEO STUDIO
// ===================================


// DAILY FREE LIMIT

const FREE_LIMIT = 5;

function todayDate() {
    const d = new Date();

    return [
        d.getFullYear(),
        String(d.getMonth() + 1).padStart(2, "0"),
        String(d.getDate()).padStart(2, "0")
    ].join("-");
}


function getUsage() {

    let data = JSON.parse(
        localStorage.getItem("sa-video-usage") || "{}"
    );

    if (data.date !== todayDate()) {

        data = {
            date: todayDate(),
            count: 0
        };

        localStorage.setItem(
            "sa-video-usage",
            JSON.stringify(data)
        );
    }

    return data;
}


// UPDATE FREE CREDITS

function updateCredits() {

    const usage = getUsage();

    const remaining = Math.max(
        0,
        FREE_LIMIT - usage.count
    );

    document.getElementById("sidebarCredits").textContent =
        `${remaining} / 5 videos available`;

    document.getElementById("remainingText").textContent =
        `${remaining} videos remaining today`;

    document.getElementById("creditProgress").style.width =
        `${remaining / FREE_LIMIT * 100}%`;
}


// NAVIGATION

function showPage(page) {

    document.querySelectorAll(".page").forEach(section => {
        section.classList.add("hidden");
    });

    document.getElementById(page + "Page")
        .classList.remove("hidden");

    document.querySelectorAll("nav a").forEach(link => {
        link.classList.toggle(
            "active",
            link.dataset.page === page
        );
    });

    document.getElementById("sidebar").classList.remove("open");

    if (page === "library") {
        renderVideos("libraryVideos");
    }

    if (page === "history") {
        renderVideos("historyVideos");
    }

    window.scrollTo(0, 0);
}


// SIDEBAR LINKS

document.querySelectorAll("nav a").forEach(link => {

    link.addEventListener("click", function(e) {

        e.preventDefault();

        showPage(this.dataset.page);

    });

});


// MOBILE MENU

function toggleSidebar() {

    document.getElementById("sidebar")
        .classList.toggle("open");

}


// DARK / LIGHT MODE

function toggleTheme() {

    document.body.classList.toggle("light");

    localStorage.setItem(
        "sa-video-theme",
        document.body.classList.contains("light")
            ? "light"
            : "dark"
    );

}


if (localStorage.getItem("sa-video-theme") === "light") {
    document.body.classList.add("light");
}


// TOAST MESSAGE

function showToast(message) {

    const toast = document.getElementById("toast");

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);

}


// NEW PROJECT

function newProject() {

    document.getElementById("prompt").value = "";

    document.getElementById("negative").value = "";

    showPage("create");

    showToast("New project started!");

}


// GENERATION MODE

let generationMode = "text";

function setMode(mode, button) {

    generationMode = mode;

    document.querySelectorAll(".mode-btn").forEach(btn => {
        btn.classList.remove("active");
    });

    button.classList.add("active");

    if (mode === "image") {

        document.getElementById("reference").required = true;

        showToast("Image to Video mode selected.");

    } else {

        document.getElementById("reference").required = false;

        showToast("Text to Video mode selected.");

    }

}


// IMPROVE PROMPT

function improvePrompt() {

    const input = document.getElementById("prompt");

    if (!input.value.trim()) {

        showToast("Please write a video prompt first.");

        return;
    }

    input.value =
        input.value.trim() +
        ", professional cinematic composition, smooth camera movement, detailed environment, beautiful lighting, high quality visuals.";

    showToast("Prompt improved!");

}


// IMAGE PREVIEW

document.getElementById("reference").addEventListener(
    "change",
    function(event) {

        const file = event.target.files[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {

            showToast("Please select a valid image.");

            return;
        }

        if (file.size > 5 * 1024 * 1024) {

            showToast("Image must be smaller than 5 MB.");

            this.value = "";

            return;
        }

        const image = document.getElementById("imagePreview");

        image.src = URL.createObjectURL(file);

        image.style.display = "block";

        document.querySelector(".upload-content").style.display =
            "none";

    }
);


// VIDEO HISTORY

function getVideos() {

    return JSON.parse(
        localStorage.getItem("sa-video-history") || "[]"
    );

}


function saveVideos(videos) {

    localStorage.setItem(
        "sa-video-history",
        JSON.stringify(videos)
    );

}


// GENERATE VIDEO

function generateVideo() {

    const prompt = document.getElementById("prompt")
        .value.trim();

    if (!prompt) {

        showToast("Please enter your video prompt.");

        return;
    }

    if (
        generationMode === "image" &&
        !document.getElementById("reference").files.length
    ) {

        showToast("Please upload a reference image.");

        return;
    }

    const usage = getUsage();

    if (usage.count >= FREE_LIMIT) {

        showToast("Daily limit reached! Upgrade your plan.");

        showPage("upgrade");

        return;
    }


    const button = document.getElementById("generateBtn");

    button.disabled = true;

    button.textContent = "Preparing Project...";


    setTimeout(() => {

        const videos = getVideos();

        const video = {

            id: Date.now(),

            prompt: prompt,

            mode: generationMode,

            ratio: document.getElementById("ratio").value,

            duration: document.getElementById("duration").value,

            quality: document.getElementById("quality").value,

            style: document.getElementById("style").value,

            date: new Date().toLocaleString()

        };


        videos.unshift(video);

        saveVideos(videos);


        usage.count++;

        localStorage.setItem(
            "sa-video-usage",
            JSON.stringify(usage)
        );


        updateCredits();


        button.disabled = false;

        button.textContent = "✦ Generate Video";


        document.getElementById("previewScreen").innerHTML = `

            <div class="preview-content">

                <div class="play-button">✓</div>

                <h3>Project Created Successfully!</h3>

                <p>Your project has been saved.</p>

                <p>Connect a real AI video API to generate the actual video.</p>

            </div>

        `;


        renderVideos("recentVideos");

        showToast("Project saved! 1 daily credit used.");

    }, 1500);

}


// RENDER VIDEOS

function renderVideos(containerId) {

    const container = document.getElementById(containerId);

    const videos = getVideos();

    if (!videos.length) {

        container.innerHTML = `
            <p class="empty-message">
                No projects available yet.
            </p>
        `;

        return;
    }


    container.innerHTML = videos.map(video => `

        <div class="video-card">

            <div class="video-thumbnail">▶</div>

            <h3>${escapeHTML(video.prompt.slice(0, 45))}</h3>

            <p>${escapeHTML(video.style)} · ${escapeHTML(video.duration)} sec</p>

            <p>${escapeHTML(video.date)}</p>

        </div>

    `).join("");

}


function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, char => ({

        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"

    })[char]);

}


// MONTHLY / YEARLY PRICING

function setBilling(type) {

    document.getElementById("monthlyBtn")
        .classList.toggle("selected", type === "monthly");

    document.getElementById("yearlyBtn")
        .classList.toggle("selected", type === "yearly");


    document.querySelectorAll(".price").forEach(price => {

        const amount = type === "monthly"
            ? price.dataset.month
            : price.dataset.year;

        const formatted = Number(amount).toLocaleString("en-PK");

        price.innerHTML = type === "monthly"
            ? `Rs. ${formatted} <small>/ month</small>`
            : `Rs. ${formatted} <small>/ year</small>`;

    });

}


// UPGRADE PLAN

function upgrade(plan) {

    showToast(
        plan + " checkout requires payment gateway integration."
    );

}


// INITIALIZE

updateCredits();

renderVideos("recentVideos");