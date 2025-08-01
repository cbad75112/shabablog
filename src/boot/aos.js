import AOS from 'aos'
import 'aos/dist/aos.css'

export default async () => {
  AOS.init({
    once: true, // 動畫只執行一次
    duration: 800,
    easing: 'ease-out'
  })
}
