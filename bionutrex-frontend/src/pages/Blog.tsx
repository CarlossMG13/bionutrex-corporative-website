import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, Eye } from 'lucide-react';
import { blogPostAPI } from '@/services/api';
import type { BlogPost } from '@/types';
import Loading from '@/components/shared/Loading';

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await blogPostAPI.getAll();
      setPosts(response.data);
      setError(null);
    } catch (err) {
      console.error('Error loading blog posts:', err);
      setError('Error al cargar los artículos del blog');
      // Fallback: sample post
      setPosts([
        {
          id: '1',
          title: 'Bienvenidos a BioNutrex',
          slug: 'bienvenidos-bionutrex',
          excerpt:
            'Conoce más sobre nuestra misión y visión en el mundo de la biotecnología nutricional.',
          content: '',
          imageUrl: '/uploads/blog-default.jpg',
          author: 'Equipo BioNutrex',
          published: true,
          views: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          publishedAt: new Date().toISOString(),
        } as unknown as BlogPost,
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="playfair text-4xl md:text-5xl lg:text-6xl font-bold text-[#0d40a5] mb-4">
              Blog BioNutrex
            </h1>
            <p className="raleway text-lg text-gray-600 max-w-3xl mx-auto">
              Descubre las últimas investigaciones, novedades y artículos científicos en
              el fascinante mundo de la biotecnología nutricional.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Modo sin conexión</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>{error}. Mostrando contenido de ejemplo.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {posts.length > 0 ? (
          <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
              >
                <div className="aspect-video bg-gray-200 relative overflow-hidden">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="p-6">
                  <h2 className="playfair text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                    <Link to={`/blog/${post.slug}`} className="hover:text-[#0d40a5] transition-colors">
                      {post.title}
                    </Link>
                  </h2>

                  <p className="raleway text-gray-600 text-sm mb-4 line-clamp-3">{post.excerpt}</p>

                  <div className="raleway flex items-center justify-between text-xs text-gray-500 mb-4">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {post.author}
                      </span>

                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(post.publishedAt || post.createdAt)}
                      </span>

                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {post.views}
                      </span>
                    </div>
                  </div>

                  <Link
                    to={`/blog/${post.slug}`}
                    className="raleway inline-flex items-center text-[#0d40a5] hover:text-[#0d40a5]/80 font-medium text-sm transition-colors"
                  >
                    Leer más
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="playfair text-2xl font-bold text-gray-900 mb-2">No hay artículos publicados</h3>
            <p className="raleway text-gray-600 mb-8">Pronto compartiremos contenido fascinante sobre biotecnología nutricional.</p>
            <Link to="/" className="raleway inline-flex items-center px-6 py-3 bg-[#0d40a5] text-white font-medium rounded-lg hover:bg-[#0d40a5]/90 transition-colors">
              Volver al inicio
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
