<template>
  <v-container>
    <v-card>
      <v-card-title>Create/update resource {{ route.params.resource }}</v-card-title>
      <v-card-subtitle> Subtitulo </v-card-subtitle>
      <ResourceForm 
        :resourceName="currentResource"
        :resourceData="resourceData" 
        :mode="mode"
        @submit="handleSubmit"
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
    middleware: ['resource']
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

  const router = useRouter()
  const route = useRoute()
  const resourceData = ref<ResourceType>()
  const resources = Object.values(Resource)
  // match the current resource from the route
  const currentResource = resources.find(resource => resource === route.params.resource) as Resource;
  // get the current id from the route
  const currentId = route.params.id;
  // if id is 0, set mode to "create", otherwise set mode to "edit"
  const mode = currentId === '0' ? 'create' : 'edit';
  // select the repository from the current resource
  const currentRepository = currentResource === Resource.Category ? categoryRepository : 
    currentResource === Resource.JobCategory ? jobCategoryRepository :
    currentResource === Resource.Offer ? offerRepository :
    currentResource === Resource.Question ? questionRepository :
    currentResource === Resource.Reply ? replyRepository :
    currentResource === Resource.Review ? reviewRepository :
    currentResource === Resource.TermsAndConditions ? termsAndConditionsRepository :
    currentResource === Resource.Job ? jobRepository : userRepository;

  const getResourceData = async () => {
    if (currentRepository === null || mode === 'create') return;
    const response = await currentRepository.findOne(currentId.toString());
    if (response !== undefined && response !== null) {
      resourceData.value = response.payload
    }
  };

  const handleSubmit = async (formData: any) => {
    if (currentRepository === null) return;
    if (mode === 'create') {
      const response = await currentRepository.create(formData);
      if (response !== undefined) {
        router.push(`/admin/${currentResource}`)
      }
    } else {
      const response = await currentRepository.update(currentId.toString(), formData);
      if (response !== undefined) {
        router.push(`/admin/${currentResource}`)
      }
    }
  };
  

  onMounted(async () => getResourceData())
</script>