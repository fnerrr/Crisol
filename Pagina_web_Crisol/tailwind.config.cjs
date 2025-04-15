/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./views/**/*.pug'],
  theme: {
    extend: {
      fontFamily: {
        title: ['Poppins', 'sans-serif'],
      },
      colors: {
        // crisol: '#4c406e',
        principal: 'var(--color-principal)',
        textoPrimario: 'var(--color-texto-primario)',
        textoSecundario: 'var(--color-texto-secundario)',
      },
    },
  },
  plugins: [],
}

