import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { CustomEase } from 'gsap/CustomEase'

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase)

// Mirrors --ease-primary in billix_agent_main/styles/css/root.css.
// All scroll-triggered reveals on the site should use this ease.
CustomEase.create('primary', '0.625, 0.05, 0, 1')

export const PRIMARY_EASE = 'primary'
