function animateBox() {
    gsap.to(".box", { 
        x: medium_X,
        rotation: -180,
        duration: 0.89,
        scaleX: 2,
        scaleY: 0.8,
        backgroundColor: '#ff6363ff',
    });
}

let isTextAnimated = false;

function toggleTextColor(element) {
    if (isTextAnimated) {
        gsap.to("body", {
            color: '#333',
            duration: 1.5,
            ease: "power2.out"
        });
        isTextAnimated = false;
    } else {
        gsap.to("body", {
            color: '#ff6363ff',
            duration: 1.5,
            ease: "power2.out"
        });
        isTextAnimated = true;
    }
}

function resetBox() {
    gsap.to(".box", {
        x: 0,
        rotation: 0,
        duration: 0,
        scaleX: 1,
        scaleY: 1,
    });
}

function getMediumPosition() {
    const boxElement = document.querySelector(".box");
    const viewportWidth = window.innerWidth;
    const boxRect = boxElement.getBoundingClientRect();
    
    const centerX = viewportWidth / 2;
    const currentX = boxRect.left + (boxRect.width / 2);
    const medium_X = centerX - currentX;
    
    return {
        medium_width: medium_X,
        medium_height: 0
    };
}

const mediumPosition = getMediumPosition();
let medium_X = mediumPosition.medium_width;
let medium_Y = mediumPosition.medium_height;

function goToHome() {
    showHome();
}

function showHome() {
    gsap.to("#aboutContent", {
        opacity: 0,
        y: 20,
        duration: 0.3,
        ease: "power2.out",
        onComplete: () => {
            document.getElementById('aboutContent').classList.add('hidden');
            document.getElementById('homeContent').classList.remove('hidden');
            
            gsap.fromTo("#homeContent", 
                { opacity: 0, y: -20 },
                { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
            );
        }
    });
    
    gsap.to("#homeBtn", {
        backgroundColor: "rgb(220 38 38)",
        duration: 0.3,
        ease: "power2.out"
    });
    
    gsap.to("#aboutBtn", {
        backgroundColor: "rgb(220 38 38 / 0.4)",
        duration: 0.3,
        ease: "power2.out"
    });
}

function showAbout() {
    gsap.to("#homeContent", {
        opacity: 0,
        y: 20,
        duration: 0.3,
        ease: "power2.out",
        onComplete: () => {
            document.getElementById('homeContent').classList.add('hidden');
            document.getElementById('aboutContent').classList.remove('hidden');
            
            gsap.fromTo("#aboutContent", 
                { opacity: 0, y: -20 },
                { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
            );
        }
    });
    
    gsap.to("#aboutBtn", {
        backgroundColor: "rgb(220 38 38)", 
        duration: 0.3,
        ease: "power2.out"
    });
    
    gsap.to("#homeBtn", {
        backgroundColor: "rgb(220 38 38 / 0.4)", 
        duration: 0.3,
        ease: "power2.out"
    });
}

document.addEventListener('DOMContentLoaded', function() {
    showHome();
});
