<template>
  <q-page
    class="q-pa-md"
    :class="$q.dark.isActive ? 'resume-dark text-white' : 'resume-light text-black'"
  >
    <!-- Anchor Floating Navigation class="z-top"-->
    <q-page-sticky position="left">
      <q-card
        flat
        bordered
        class="q-pa-sm q-mt-xl rounded-borders shadow-2"
        :class="$q.dark.isActive ? 'bg-grey-10 text-white' : 'bg-grey-1 text-black '"
        style="border-left: 4px solid #3f51b5"
      >
        <q-list dense>
          <q-item
            v-for="anchor in anchors"
            :key="anchor.id"
            clickable
            @click="scrollTo(anchor.id)"
            :active="activeAnchor === anchor.id"
            active-class="text-white bg-indigo "
          >
            <q-item-section>{{ anchor.label }}</q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </q-page-sticky>

    <!-- Resume Content -->
    <section id="top" data-aos="fade-down" class="q-my-xl q-pa-md">
      <div class="row items-start q-col-gutter-xl justify-center">
        <!-- 左側：個人照片與基本資訊 -->
        <div class="col-xs-12 col-md-4 text-center">
          <q-img
            :src="meImg"
            class="rounded-borders shadow-4 resume-card"
            style="max-width: 300px; border: 4px solid #ccc"
          />
          <h1 class="text-h4 q-mt-md">陳克誠</h1>
          <p>
            <q-icon name="person" class="q-mr-sm" />
            男・26歲・役畢（2023/2）
          </p>

          <p class="text-sm">
            <q-icon name="phone" class="q-mr-sm" /> 0917-009-909<br />
            <q-icon name="email" class="q-mr-sm" /> cbad75116@gmail.com
          </p>
        </div>

        <!-- 右側：自傳與求學經歷 -->
        <div class="col-xs-12 col-md-8">
          <q-card
            flat
            bordered
            class="q-pa-md q-mb-md rounded-borders"
            :class="$q.dark.isActive ? 'bg-grey-9 text-white' : 'bg-grey-1 text-black'"
          >
            <div
              class="text-h4 text-bold q-mb-sm"
              :class="
                $q.dark.isActive
                  ? 'bg-grey-9 text-white text-outline'
                  : 'bg-grey-2 text-black text-outline2'
              "
            >
              自傳
            </div>
            <q-separator spaced />

            <div class="text-subtitle2 q-mt-sm" style="font-size: 22px">
              <q-icon name="person_outline" class="q-mr-sm" />
              【關於我】
            </div>
            <p class="q-mt-xs" style="font-size: 20px">
              大學畢業於台中科技大學資訊工程學系，碩士畢業於台中科技大學資訊工程學系，個人優點是適應力佳，不管是在大學初期還是碩士都能快速適應環境進入狀況，相信未來在職場上能有所助力。
            </p>

            <div class="text-subtitle2 q-mt-md" style="font-size: 22px">
              <q-icon name="school" class="q-mr-sm" />
              【求學經歷】
            </div>
            <p class="q-mt-xs" style="font-size: 20px">
              大學期間除了積極學習資訊相關的理論，並維持系排前十名，曾對課外的程式語言有興趣並自學了
              Python 語言、樹莓派、電腦軟體丙級證照和 MVC
              網路架構，其中，電腦軟體丙級證照在文書處理方面有大幅度的進步，在我碩士給我極大的助力，在大學三年級時就已經修完所有的學分，大學四年有在補習班當助教的經驗。
            </p>
          </q-card>
        </div>
      </div>
    </section>

    <section :id="'certs'" data-aos="fade-up" class="q-mt-xl section-block text-center">
      <q-card
        flat
        bordered
        class="q-pa-md q-mb-md rounded-borders"
        :class="
          $q.dark.isActive
            ? 'bg-grey-9 text-white text-outline'
            : 'bg-grey-2 text-black text-outline2'
        "
      >
        <div class="text-h4 text-white-6">證照與語言能力</div>
      </q-card>

      <div class="row q-col-gutter-md" style="margin-top: 10px">
        <!-- 證照 -->
        <div class="col-12 col-md-6">
          <q-card
            flat
            bordered
            class="q-pa-md rounded-borders"
            :class="$q.dark.isActive ? 'bg-grey-10' : 'bg-grey-1'"
          >
            <div class="text-h6 text-center text-white q-mb-sm text-note">
              <q-icon name="verified" class="q-mr-sm" />
              證照
            </div>

            <q-list
              dense
              bordered
              class="resume-card text-subtitle2"
              :class="$q.dark.isActive ? 'bg-grey-10 text-white' : 'bg-grey-1 text-black'"
            >
              <q-item v-for="(cert, i) in certs" :key="i">
                <q-item-section>{{ cert }}</q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </div>

        <!-- 語言與駕照 -->
        <div class="col-12 col-md-6">
          <q-card
            flat
            bordered
            class="q-pa-md rounded-borders"
            :class="$q.dark.isActive ? 'bg-grey-10' : 'bg-grey-1'"
          >
            <div class="text-h6 text-center text-white q-mb-sm text-note">
              <q-icon name="translate" class="q-mr-sm" />
              語言與駕照
            </div>
            <q-list
              dense
              bordered
              class="resume-card text-subtitle2"
              :class="$q.dark.isActive ? 'bg-grey-10 text-white' : 'bg-grey-1 text-black'"
            >
              <q-item v-for="(l, i) in languages" :key="i">
                <q-item-section>{{ l }}</q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </div>
      </div>
    </section>

    <section :id="'education'" data-aos="fade-up" class="q-mt-xl text-center">
      <q-card
        flat
        bordered
        class="q-pa-md q-mb-md rounded-borders"
        :class="
          $q.dark.isActive
            ? 'bg-grey-9 text-white text-outline'
            : 'bg-grey-2 text-black text-outline2'
        "
      >
        <div class="text-h4 text-white-6">學歷</div>
      </q-card>
      <q-timeline color="indigo" class="q-mt-md dense">
        <q-timeline-entry
          v-for="(item, i) in education"
          :key="i"
          :title="item.school"
          :subtitle="item.year"
          class="text-center"
          icon="school"
        />
      </q-timeline>
    </section>

    <section :id="'experience'" data-aos="fade-up" class="q-mt-xl text-center">
      <q-card
        flat
        bordered
        class="q-pa-md q-mb-md rounded-borders"
        :class="
          $q.dark.isActive
            ? 'bg-grey-9 text-white text-outline'
            : 'bg-grey-2 text-black text-outline2'
        "
      >
        <div class="text-h4 text-white-6">工作經驗</div>
      </q-card>
      <q-card :class="$q.dark.isActive ? 'bg-grey-10 text-white' : 'bg-grey-2 text-black'">
        <q-card-section>
          <div class="text-h6">
            <q-icon name="work" class="q-mr-sm" />
            光田醫院
          </div>
          <div>
            <q-icon name="schedule" class="q-mr-sm" />
            工作年資：2年
          </div>
          <q-img
            :src="workImg"
            class="rounded-borders shadow-4 resume-card"
            style="max-width: 300px"
          />
        </q-card-section>
      </q-card>
    </section>

    <section :id="'skills'" data-aos="zoom-in-up" class="q-mt-xl">
      <q-card
        flat
        bordered
        class="q-pa-md q-mb-md rounded-borders text-center"
        :class="
          $q.dark.isActive
            ? 'bg-grey-9 text-white text-outline'
            : 'bg-grey-2 text-black text-outline2'
        "
      >
        <div class="text-h4 text-white-6">程式語言</div>
      </q-card>
      <div class="skills-grid q-mt-sm">
        <div v-for="(skill, i) in skills" :key="i" class="skill-grid-item">
          <q-avatar color="indigo-2" text-color="indigo-10" size="56px">
            <q-icon :name="skillIcons[skill]" size="28px" />
          </q-avatar>
          <div class="skill-label q-mt-xs">{{ skill }}</div>
        </div>
      </div>
    </section>

    <section :id="'projects'" class="q-mt-xl">
      <q-card
        flat
        bordered
        class="q-pa-md q-mb-md rounded-borders text-center"
        :class="
          $q.dark.isActive
            ? 'bg-grey-9 text-white text-outline'
            : 'bg-grey-2 text-black text-outline2'
        "
      >
        <div class="text-h4 text-white-6">專案成就</div>
      </q-card>
      <div
        v-for="(proj, i) in projects"
        :key="i"
        class="row items-center q-mb-xl"
        :data-aos="i % 2 === 0 ? 'fade-right' : 'fade-left'"
      >
        <!-- 圖片左文字右 -->
        <template v-if="i % 2 === 0">
          <div class="col-12 col-md-6">
            <q-img
              :src="proj.img"
              class="rounded-borders shadow-4 resume-card"
              style="max-width: 100%"
            />
          </div>
          <div class="col-12 col-md-6 q-pl-md">
            <h3 class="text-subtitle1 q-mb-sm">
              <q-icon name="folder_open" class="q-mr-sm" />
              {{ proj.title }}
              <span class="text-caption">{{ proj.date }}</span>
            </h3>

            <p class="text-sm text-subtitle2">{{ proj.desc }}</p>
            <ul class="text-sm text-subtitle2 q-mt-sm">
              <li v-for="(point, j) in proj.points" :key="j">{{ point }}</li>
            </ul>
          </div>
        </template>

        <!-- 文字左圖片右 -->
        <template v-else>
          <div class="col-12 col-md-6 order-md-1 q-pr-md">
            <h3 class="text-subtitle1 q-mb-sm">
              <q-icon name="folder_open" class="q-mr-sm" />
              {{ proj.title }}
              <span class="text-caption">{{ proj.date }}</span>
            </h3>

            <p class="text-sm text-subtitle2">{{ proj.desc }}</p>
            <ul class="text-sm text-subtitle2 q-mt-sm">
              <li v-for="(point, j) in proj.points" :key="j">{{ point }}</li>
            </ul>
          </div>
          <div class="col-12 col-md-6 order-md-2">
            <q-img
              :src="proj.img"
              class="rounded-borders shadow-4 resume-card"
              style="max-width: 100%"
            />
          </div>
        </template>
      </div>
    </section>

    <!-- Back to Top -->
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn icon="arrow_upward" round color="indigo" @click="scrollTo('top')" />
    </q-page-sticky>
  </q-page>
</template>
<script setup>
  import { ref, onMounted, onBeforeUnmount } from 'vue'
  import AOS from 'aos'
  import 'aos/dist/aos.css'

  const activeAnchor = ref('')
  const sectionOffsets = ref([])

  const updateActiveAnchor = () => {
    const scrollPosition = window.scrollY + 150 // 偏移量調整，視情況調整
    for (let i = sectionOffsets.value.length - 1; i >= 0; i--) {
      if (scrollPosition >= sectionOffsets.value[i].offsetTop) {
        activeAnchor.value = sectionOffsets.value[i].id
        break
      }
    }
  }

  onMounted(() => {
    AOS.init({
      once: false,
      duration: 800,
      mirror: true,
      offset: 100
    })

    // 初始化所有 section offsetTop
    sectionOffsets.value = anchors.map(anchor => {
      const el = document.getElementById(anchor.id)
      return {
        id: anchor.id,
        offsetTop: el ? el.offsetTop : 0
      }
    })

    window.addEventListener('scroll', updateActiveAnchor)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('scroll', updateActiveAnchor)
  })

  const scrollTo = id => {
    const el = document.getElementById(id)
    if (el) {
      const yOffset = -100 // 往上補正的像素數
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }
  const anchors = [
    { id: 'top', label: '首頁' },
    { id: 'certs', label: '證照' },
    { id: 'education', label: '學歷' },
    { id: 'experience', label: '經驗' },
    { id: 'skills', label: '程式' },
    { id: 'projects', label: '專案' }
    // { id: 'lang', label: '語言' }
  ]

  const education = [
    { school: '追分國小', year: '2004' },
    { school: '大道國中', year: '2010' },
    { school: '僑泰高中 資訊科', year: '2013' },
    { school: '台中科大 資工系', year: '2016' },
    { school: '台中科大 資工碩士', year: '2020' },
    { school: '碩士畢業', year: '2022' }
  ]

  const skills = ref([
    'C',
    'C#',
    'Java',
    'VB',
    'Python',
    'MY SQL',
    'MS SQL',
    'Oracle',
    'Quasar',
    'Jquery',
    'Node.js',
    'CSS',
    'JavaScript',
    'Vue',
    'Angular',
    'Git'
  ])

  // 對應的 icon 名稱（可根據你實際圖示調整）
  const skillIcons = {
    C: 'mdi-language-c',
    'C#': 'mdi-language-csharp',
    Java: 'mdi-language-java',
    VB: 'mdi-code-tags',
    Python: 'mdi-language-python',
    'MY SQL': 'mdi-database',
    'MS SQL': 'mdi-database',
    Oracle: 'mdi-database',
    Quasar: 'mdi-vuejs', // 沒有官方icon，先用代表碼
    Jquery: 'mdi-jquery',
    'Node.js': 'mdi-nodejs',
    CSS: 'mdi-language-css3',
    JavaScript: 'mdi-language-javascript',
    Vue: 'mdi-vuejs',
    Angular: 'mdi-angular',
    Git: 'mdi-git'
  }

  const workImg = '/images/resume/Logo.jpg'
  const meImg = '/images/Me.png'

  const certs = [
    '乙級電腦硬體裝修技術士',
    '丙級電腦硬體裝修技術士',
    '丙級電腦軟體設計技術士',
    'Andes Certified Engineer-ACE (Intermediate Level)'
  ]

  const languages = [
    '英文：略懂（聽 / 說 / 讀 / 寫）',
    '台語：精通',
    '駕照：機車、汽車',
    '交通工具：汽車 / 機車'
  ]

  const projects = [
    {
      img: '/images/resume/project1.jpg',
      title: '科技部大專生研究計畫',
      date: '2019/7 ~ 2020/2',
      desc: '擔任計畫主持人，利用 OpenCV 進行生物辨識，建置 Chaos-AES 強化安全系統。',
      points: [
        '1. 透過 NFC 系統達到門禁管理目的',
        '2. 利用生物辨識判定出入人員身份',
        '3. Chaos-AES 加密登入資料並存至資料庫',
        '4. 對檔案做 AES 加密'
      ]
    },
    {
      img: '/images/resume/project2.jpg',
      title: '碩士論文、期刊計畫和研討會',
      date: '2020/9 ~ 2022/1',
      desc: '論文主題為「基於四階混沌遊戲表示結合雙混沌系統和 SHA-256 之量子圖像加密應用於5G物聯網」',
      points: [
        '期刊：Energy Efficiency of Mobile Devices Using Fuzzy Logic Control by Exponential Weight with Priority-Based Rate Control in Multi-Radio Opportunistic Networks',
        '研討會：The 11th International Multi-Conference on Engineering and Technology Innovation 2022 (IMETI2022)-基於混沌遊戲表示之量子圖像加密應用於5G物聯網方法'
      ]
    },
    {
      img: '/images/resume/project3.jpg',
      title: '107全國機器人創意競賽獎狀',
      date: '',
      desc: '參賽107全國機器人創意競賽，擔任組長並榮獲第三名',
      points: []
    }
  ]
</script>

<style scoped>
  .bg-dark {
    background-color: #121212;
  }

  .section-block {
    min-height: 300px;
    scroll-margin-top: 80px;
    border-radius: 8px;
  }

  .rounded-borders {
    border-radius: 8px;
  }

  /* 調整學歷時間軸橫向的條目寬度 */
  .q-timeline__entry {
    min-width: 150px;
  }

  /* 專案成就：圖片和文字左右交錯 */
  .row.items-center {
    align-items: center;
  }

  .row.items-center > div {
    padding: 0 12px;
  }

  /* 針對不同寬度裝置微調 */
  @media (max-width: 767px) {
    .row.items-center > div {
      padding: 0 !important;
    }
  }

  /* 文字部分間距 */
  .text-sm ul {
    padding-left: 1.2rem;
    margin-top: 0.5rem;
  }

  .bg-opacity-10 {
    opacity: 0.1;
  }

  .text-subtitle1 {
    font-size: 22px;
  }

  .text-subtitle2 {
    font-size: 20px;
  }

  .text-outline {
    text-shadow:
      -1px -1px 0 #a1c4fd,
      1px -1px 0 #a1c4fd,
      -1px 1px 0 #a1c4fd,
      1px 1px 0 #a1c4fd;
  }

  .text-note {
    text-shadow:
      -1px -1px 0 #aaa9a9,
      1px -1px 0 #aaa9a9,
      -1px 1px 0 #aaa9a9,
      1px 1px 0 #aaa9a9;
  }

  .text-outline2 {
    text-shadow:
      -1px -1px 0 #444444,
      1px -1px 0 #333333,
      -1px 1px 0 #222222,
      1px 1px 0 #111111;
  }

  .skills-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(96px, 1fr));
    gap: 1.2rem 1rem;
    justify-items: center;
  }

  .skill-grid-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: var(--q-color-indigo-7);
    transition: color 0.3s ease;
    user-select: none;
  }

  .skill-grid-item:hover {
    color: var(--q-color-indigo-10);
    cursor: default;
  }

  .skill-label {
    margin-top: 0.3rem;
    font-size: 0.85rem;
    font-weight: 600;
    text-align: center;
    white-space: nowrap;
  }
</style>
