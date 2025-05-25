import { vi } from 'vitest'
import { config } from '@vue/test-utils'

vi.mock('*.css', () => ({}))
vi.mock('*.scss', () => ({}))
vi.mock('*.sass', () => ({}))
vi.mock('*.less', () => ({}))

vi.mock('vuetify', () => ({
    createVuetify: vi.fn(() => ({})),
    useTheme: vi.fn(() => ({
        current: { value: { colors: {} } },
        themes: { value: {} }
    })),
    useDisplay: vi.fn(() => ({
        mobile: { value: false },
        tablet: { value: false },
        desktop: { value: true }
    }))
}))

vi.mock('vuetify/components', () => ({}))
vi.mock('vuetify/directives', () => ({}))

config.global.config.globalProperties = {
    $vuetify: {
        theme: { current: { value: { colors: {} } } },
        display: { mobile: false, tablet: false, desktop: true }
    }
}