import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import axiosInstance from '../../config/axios';

const schema = yup.object().shape({
  title: yup.object().shape({
    default: yup.string().required('Title is required').max(60, 'Title should be max 60 characters'),
    template: yup.string()
  }),
  description: yup.string().required('Description is required').max(160, 'Description should be max 160 characters'),
  keywords: yup.string().required('Keywords are required'),
  openGraph: yup.object().shape({
    title: yup.string().required('OG title is required').max(60, 'OG title should be max 60 characters'),
    description: yup.string().required('OG description is required').max(160, 'OG description should be max 160 characters'),
    type: yup.string(),
    image: yup.string().url('Must be a valid image URL')
  }),
  twitter: yup.object().shape({
    title: yup.string().required('Twitter title is required').max(60, 'Twitter title should be max 60 characters'),
    description: yup.string().required('Twitter description is required').max(160, 'Twitter description should be max 160 characters'),
    image: yup.string().url('Must be a valid image URL'),
    card: yup.string()
  })
});

const SeoLayout = () => {
  const pages = ['home', 'about', 'services', 'blog', 'contact'];
  const [selectedPage, setSelectedPage] = React.useState('home');
  const [isLoading, setIsLoading] = React.useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: {
        default: '',
        template: ''
      },
      description: '',
      keywords: '',
      openGraph: {
        type: 'website',
        title: '',
        description: '',
        image: ''
      },
      twitter: {
        card: 'summary_large_image',
        title: '',
        description: '',
        image: ''
      }
    }
  });

  useEffect(() => {
    const fetchSEOData = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get(`seo/get/${selectedPage}`);
        const data = response.data;
        
        reset({
          title: {
            default: data.title || '',
            template: ''
          },
          description: data.description || '',
          keywords: data.keywords || '',
          openGraph: {
            type: data.ogType || 'website',
            title: data.ogTitle || '',
            description: data.ogDescription || '',
            image: data.ogImage || ''
          },
          twitter: {
            card: data.twitterCard || 'summary_large_image',
            title: data.twitterTitle || '',
            description: data.twitterDescription || '',
            image: data.twitterImage || ''
          }
        });
      } catch (error) {
        reset({
          title: {
            default: null,
            template: null
          },
          description: null,
          keywords: null,
          openGraph: {
            type: null,
            title: null,
            description: null,
            image: null
          },
          twitter: {
            card: null,
            title: null,
            description: null,
            image: null
          }
        });
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchSEOData();
  }, [selectedPage, reset]);

  const onSubmit = async (data) => {
    try {
      const response = await axiosInstance.post(`seo/upsert/${selectedPage}`, {
        pageTitle: selectedPage,
        title: data.title.default,
        description: data.description,
        keywords: data.keywords,
        ogTitle: data.openGraph.title,
        ogDescription: data.openGraph.description,
        ogImage: data.openGraph.image,
        ogType: data.openGraph.type,
        twitterCard: data.twitter.card,
        twitterTitle: data.twitter.title,
        twitterDescription: data.twitter.description,
        twitterImage: data.twitter.image
      });
      
      if (response.status === 200) {
        toast.success('SEO data saved successfully');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save SEO data');
    }
  };

  const handlePageChange = (page) => {
    setSelectedPage(page);
  };

  return (
    <div className="w-full mx-auto bg-base-100 p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-content">SEO Settings</h2>
        <div className="dropdown dropdown-end tooltip tooltip-open tooltip-left" data-tip="Select a page">
          <div tabIndex={0} role="button" className="btn m-1">
            {selectedPage.charAt(0).toUpperCase() + selectedPage.slice(1)}
          </div>
          <ul tabIndex={0} className="dropdown-content menu bg-base-200 rounded-box z-[1] w-52 p-2 shadow">
            {pages.map(page => (
              <li key={page}>
                <a onClick={() => handlePageChange(page)}>
                  {page.charAt(0).toUpperCase() + page.slice(1)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-screen">
           <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <section className="space-y-4 bg-base-200 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-neutral-content">Basic Meta Tags</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-neutral-content block mb-1">Title</label>
                <input
                  {...register('title.default')}
                  className="w-full p-2 bg-base-200 border border-gray-300 rounded-md"
                  placeholder="Enter page title"
                />
                {errors.title?.default && (
                  <p className="text-red-500 text-sm mt-1">{errors.title.default.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-content block mb-1">Description</label>
                <textarea
                  {...register('description')}
                  className="w-full p-2 bg-base-200 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Enter page description"
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-content block mb-1">Keywords</label>
                <textarea
                  {...register('keywords')}
                  className="w-full p-2 bg-base-200 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Enter keywords (comma-separated)"
                />
                {errors.keywords && (
                  <p className="text-red-500 text-sm mt-1">{errors.keywords.message}</p>
                )}
              </div>
            </div>
          </section>

          <section className="space-y-4 bg-base-200 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-neutral-content">Open Graph</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-neutral-content block mb-1">OG Title</label>
                <input
                  {...register('openGraph.title')}
                  className="w-full p-2 bg-base-200 border border-gray-300 rounded-md"
                  placeholder="Enter Open Graph title"
                />
                {errors.openGraph?.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.openGraph.title.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-content block mb-1">OG Description</label>
                <textarea
                  {...register('openGraph.description')}
                  className="w-full p-2 bg-base-200 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Enter Open Graph description"
                />
                {errors.openGraph?.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.openGraph.description.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-content block mb-1">OG Image URL</label>
                <input
                  {...register('openGraph.image')}
                  className="w-full p-2 bg-base-200 border border-gray-300 rounded-md"
                  placeholder="Enter Open Graph image URL"
                />
                {errors.openGraph?.image && (
                  <p className="text-red-500 text-sm mt-1">{errors.openGraph.image.message}</p>
                )}
              </div>
            </div>
          </section>

          <section className="space-y-4 bg-base-200 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-neutral-content">Twitter Card</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-neutral-content block mb-1">Twitter Title</label>
                <input
                  {...register('twitter.title')}
                  className="w-full p-2 bg-base-200 border border-gray-300 rounded-md"
                  placeholder="Enter Twitter title"
                />
                {errors.twitter?.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.twitter.title.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-content block mb-1">Twitter Description</label>
                <textarea
                  {...register('twitter.description')}
                  className="w-full p-2 bg-base-200 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Enter Twitter description"
                />
                {errors.twitter?.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.twitter.description.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-content block mb-1">Twitter Image URL</label>
                <input
                  {...register('twitter.image')}
                  className="w-full p-2 bg-base-200 border border-gray-300 rounded-md"
                  placeholder="Enter Twitter image URL"
                />
                {errors.twitter?.image && (
                  <p className="text-red-500 text-sm mt-1">{errors.twitter.image.message}</p>
                )}
              </div>
            </div>
          </section>

          <button 
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Save SEO Settings
          </button>
        </form>
      )}
    </div>
  );
};

export default SeoLayout;