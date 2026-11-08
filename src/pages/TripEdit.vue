<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppBar from '@/components/AppBar.vue'
import { useTripsStore, type TripDraft } from '@/stores/trips'
import { today } from '@/lib/format'
import { toast } from '@/lib/toast'

const route = useRoute()
const router = useRouter()
const trips = useTripsStore()

const editId = computed(() => (typeof route.params.id === 'string' ? route.params.id : ''))
const isEdit = computed(() => editId.value.length > 0)
const saving = ref(false)

const form = reactive<TripDraft>({
  title: '',
  country: '中国',
  province: '',
  city: '',
  startDate: today(),
  endDate: today(),
  summary: '',
})

onMounted(async () => {
  await trips.init()
  if (!isEdit.value) {
    // 从地图「记一次去这里的旅行」进来时，把省份带上
    const province = route.query.province
    if (typeof province === 'string' && province) form.province = province
    return
  }

  const trip = trips.get(editId.value)
  if (!trip) {
    toast('找不到这次旅行')
    router.replace('/diary')
    return
  }

  form.title = trip.title
  form.country = trip.country ?? '中国'
  form.province = trip.province ?? ''
  form.city = trip.city ?? ''
  form.startDate = trip.startDate
  form.endDate = trip.endDate ?? trip.startDate
  form.summary = trip.summary ?? ''
})

async function save(): Promise<void> {
  if (!form.title.trim()) {
    toast('给这次旅行起个名字')
    return
  }
  if (!form.startDate) {
    toast('选一个出发日期')
    return
  }
  if (form.endDate && form.endDate < form.startDate) {
    toast('返回日期不能早于出发日期')
    return
  }

  saving.value = true
  try {
    if (isEdit.value) {
      await trips.update(editId.value, { ...form })
      toast('已保存')
      router.back()
    } else {
      const trip = await trips.create({ ...form })
      toast('旅行已创建')
      router.replace(`/trip/${trip.id}`)
    }
  } finally {
    saving.value = false
  }
}

async function remove(): Promise<void> {
  if (!isEdit.value) return
  const ok = window.confirm('删除这次旅行？照片也会一起删除，无法恢复。')
  if (!ok) return
  await trips.remove(editId.value)
  toast('已删除')
  router.replace('/diary')
}
</script>

<template>
  <div class="page edit">
    <AppBar :title="isEdit ? '编辑旅行' : '新建旅行'" />

    <div class="body">
      <label class="field">
        <span class="label">名称</span>
        <input v-model="form.title" class="input" placeholder="例如 大理 · 洱海环湖" />
      </label>

      <div class="row">
        <label class="field">
          <span class="label">国家</span>
          <input v-model="form.country" class="input" placeholder="中国" />
        </label>
        <label class="field">
          <span class="label">省份</span>
          <input v-model="form.province" class="input" placeholder="云南" />
        </label>
      </div>

      <label class="field">
        <span class="label">城市</span>
        <input v-model="form.city" class="input" placeholder="大理" />
      </label>

      <div class="row">
        <label class="field">
          <span class="label">出发</span>
          <input v-model="form.startDate" class="input" type="date" />
        </label>
        <label class="field">
          <span class="label">返回</span>
          <input v-model="form.endDate" class="input" type="date" />
        </label>
      </div>

      <label class="field">
        <span class="label">一句话</span>
        <textarea
          v-model="form.summary"
          class="input textarea"
          rows="3"
          placeholder="这次旅行想记住什么？"
        />
      </label>

      <button class="btn-primary save" type="button" :disabled="saving" @click="save">
        {{ saving ? '保存中…' : isEdit ? '保存修改' : '创建旅行' }}
      </button>

      <button v-if="isEdit" class="danger" type="button" @click="remove">
        删除这次旅行
      </button>
    </div>
  </div>
</template>

<style scoped>
.edit {
  padding-bottom: calc(env(safe-area-inset-bottom) + 40px);
}

.body {
  padding: 8px 20px 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.row {
  display: flex;
  gap: 12px;
}

.label {
  font-size: 11px;
  letter-spacing: 1.2px;
  color: var(--muted);
}

.input {
  width: 100%;
  height: 46px;
  padding: 0 14px;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  background: var(--surface);
  color: var(--ink);
  font-size: 15px;
  font-family: inherit;
  outline: none;
  transition: border-color 160ms ease;
}

.input:focus {
  border-color: var(--forest);
}

.input::placeholder {
  color: var(--muted-soft);
}

.textarea {
  height: auto;
  padding: 12px 14px;
  font-size: 14px;
  line-height: 1.6;
  resize: none;
}

.save {
  margin-top: 8px;
}

.danger {
  margin-top: 4px;
  height: 44px;
  color: var(--danger);
  font-size: 13px;
}
</style>
