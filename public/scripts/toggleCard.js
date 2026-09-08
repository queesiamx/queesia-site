document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".toggle-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const id = button.getAttribute("data-id");
        const extraInfo = document.getElementById(`extra-info-${id}`);
  
        if (extraInfo) {
          extraInfo.classList.toggle("hidden");
          button.textContent = extraInfo.classList.contains("hidden") ? "Ver más" : "Mostrar menos";
        } else {
          console.error("Elemento no encontrado:", `extra-info-${id}`);
        }
      });
    });
  });
  