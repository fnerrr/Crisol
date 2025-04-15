document.getElementById('contactoForm').addEventListener('submit', async function (event) {
    event.preventDefault(); // Evita que el formulario se envíe de forma tradicional

    const formData = new FormData(this); // Obtiene los datos del formulario

    try {
        const response = await fetch('/contacto', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            // Muestra el mensaje de éxito
            const successAlert = document.getElementById('successAlert');
            successAlert.classList.remove('hidden');

            // Limpia los campos del formulario
            this.reset();

            // Oculta el mensaje de éxito después de 5 segundos
            setTimeout(() => {
                successAlert.classList.add('hidden');
            }, 5000); // 5000 ms = 5 segundos
        } else {
            alert(result.message); // Muestra una alerta de error
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Hubo un error al enviar el formulario');
    }
});