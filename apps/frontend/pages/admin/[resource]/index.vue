<template>
  <v-container>
    <v-card>
      <v-card-title v-if="!isLoaded">Loading...</v-card-title>
      <ResourceTable v-else :resourceName="currentResource" :resourceData="resourceData" :resourceHeaders="resourceHeaders"
        @create="handleCreate"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
  import { Resource, type ResourceType } from '~/types/resource';
  import CategoryRepository from '~/repositories/categoryRepository';
  import JobCategoryRepository from '~/repositories/jobCategoryRepository';
  import JobRepository from '~/repositories/jobRepository';
  import UserRepository from '~/repositories/userRepository';
  import OfferRepository from '~/repositories/offerRepository';
  import QuestionRepository from '~/repositories/questionRepository';
  import ReviewRepository from '~/repositories/reviewRepository';
  import ReplyRepository from '~/repositories/replyRepository';
  import TermsAndConditionsRepository from '~/repositories/termsAndConditionsRepository';

  definePageMeta({
    middleware: ['resource', 'auth']
  });
  const { $api } = useNuxtApp();
  const categoryRepository = new CategoryRepository($api);
  const jobCategoryRepository = new JobCategoryRepository($api);
  const jobRepository = new JobRepository($api);
  const userRepository = new UserRepository($api);
  const offerRepository = new OfferRepository($api);
  const questionRepository = new QuestionRepository($api);
  const reviewRepository = new ReviewRepository($api);
  const replyRepository = new ReplyRepository($api);
  const termsAndConditionsRepository = new TermsAndConditionsRepository($api);
  
  const isLoaded = ref(false)
  const route = useRoute()
  const router = useRouter()
  const resourceData = ref<ResourceType[]>([])
  const resourceHeaders = ref();
  const resources = Object.values(Resource)
  // match the current resource from the route
  const currentResource = resources.find(resource => resource === route.params.resource) as Resource;
  // select the repository from the current resource
  const currentRepository = currentResource === Resource.Category ? categoryRepository : 
    currentResource === Resource.JobCategory ? jobCategoryRepository :
    currentResource === Resource.Offer ? offerRepository :
    currentResource === Resource.Question ? questionRepository :
    currentResource === Resource.Reply ? replyRepository :
    currentResource === Resource.Review ? reviewRepository :
    currentResource === Resource.TermsAndConditions ? termsAndConditionsRepository :
    currentResource === Resource.Job ? jobRepository : userRepository;
  
    const getTableData = async () => {
    if (currentRepository === null) return;
    const response = await currentRepository.findAll();
    if (response !== undefined) {
      if (response.payload.length === 0) {
        router.push(`/admin/${currentResource}/resource-0`);
      }
      const headers = Object.keys(response.payload[0]);
      if (!headers.includes('actions')) headers.push('actions');
      resourceHeaders.value = headers.map(item => {
        const titlePart = item.split('.')[0]; // Extract the part before the dot for the title
        return {
          title: titlePart.charAt(0).toUpperCase() + titlePart.slice(1), // Capitalize the first letter
          key: item,
        };
      });
      resourceData.value = response.payload
    }
    isLoaded.value = true;
  };

  const handleCreate = () => {
    router.push(`/admin/${currentResource}/resource-0`);
  }
  const handleEdit = (index: number) => {
    router.push(`/admin/${currentResource}/resource-${index}`);
  }
  const handleDelete = async (index: number) => {
    //number to string
    const stringIndex = index.toString();
    const response = await currentRepository.delete(stringIndex);
    getTableData();
  }

  onMounted(async () => getTableData())
</script>