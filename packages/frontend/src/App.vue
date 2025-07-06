<template>
  <!-- 主容器 -->
  <div id="app-container">
    <h1>需求分析平台</h1>

    <!-- 创建新项目卡片 -->
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>创建新项目</span>
        </div>
      </template>
      <el-form @submit.prevent="createProject">
        <el-input v-model="newProjectName" placeholder="输入新项目名称..." />
        <el-button type="primary" native-type="submit" style="margin-top: 10px;" :loading="isLoading">
          创建并关联Dify知识库
        </el-button>
      </el-form>
    </el-card>

    <!-- 项目列表卡片 -->
    <el-card class="box-card" style="margin-top: 20px;">
       <template #header>
        <div class="card-header">
          <span>项目列表</span>
        </div>
      </template>
      <el-table :data="projects" v-loading="isLoading">
        <el-table-column prop="name" label="项目名称" />
        <el-table-column prop="difyKnowledgeBaseId" label="Dify Knowledge Base ID" />
        <el-table-column prop="createdAt" label="创建时间" :formatter="formatTime" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';

// 项目数据接口定义
interface Project {
  id: string;
  name: string;
  difyKnowledgeBaseId: string;
  createdAt: string;
}

// API客户端配置
const apiClient = axios.create({ baseURL: 'http://localhost:3001/api' });

// 响应式状态定义
const newProjectName = ref(''); // 新项目名称
const projects = ref<Project[]>([]); // 项目列表
const isLoading = ref(false); // 加载状态

// 获取项目列表
const fetchProjects = async () => {
  isLoading.value = true;
  try {
    const response = await apiClient.get('/projects');
    projects.value = response.data;
  } catch (error) { ElMessage.error('获取项目列表失败'); }
  finally { isLoading.value = false; }
};

// 创建新项目
const createProject = async () => {
  if (!newProjectName.value.trim()) return;
  isLoading.value = true;
  try {
    await apiClient.post('/projects', { name: newProjectName.value });
    newProjectName.value = '';
    ElMessage.success('项目创建成功！');
    await fetchProjects();
  } catch (error) { ElMessage.error('创建项目失败'); }
  finally { isLoading.value = false; }
};

// 格式化时间显示
const formatTime = (_row: any, _column: any, cellValue: string) => {
  if (!cellValue) return '';
  return new Date(cellValue).toLocaleString();
};

// 组件挂载时获取项目列表
onMounted(fetchProjects);
</script>

<style>
  /* 主容器样式 */
  #app-container { padding: 20px; max-width: 800px; margin: auto; }
  /* 卡片样式 */
  .box-card { width: 100%; }
</style>