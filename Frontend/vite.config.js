import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [
        react(),
        tailwindcss({
            config: {
                theme: {
                    extend: {
                        fontFamily: {
                            sans: [
                                'Roboto', // Türkçe karakter destekli font
                                'system-ui',
                                '-apple-system',
                                'Segoe UI',
                                'Arial',
                                'sans-serif'
                            ],
                        },
                    },
                },
            },
        }),
    ],
})