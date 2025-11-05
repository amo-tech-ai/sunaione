import React, { useState } from 'react';
import { Article } from '../types';
import { PublicHeader } from './HomePage';
import Footer from '../components/Footer';
import { SearchIcon, ArrowRightIcon } from '../components/Icons';
import { NavigateFunction } from 'react-router-dom';

interface BlogScreenProps {
    articles: Article[];
    navigate: NavigateFunction;
}

const categories = ['All', 'AI News', 'Founder Stories', 'Tutorials', 'Events', 'Startup Lessons'];

const FeaturedArticleCard: React.FC<{ article: Article }> = ({ article }) => {
    return (
        <div className="relative rounded-2xl overflow-hidden group cursor-pointer shadow-lg hover:shadow-2xl transition-shadow duration-300 animate-fade-in">
            <img src={article.imageUrl} alt={article.title} className="w-full h-96 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-8 text-white">
                <span className="text-sm font-bold px-3 py-1 rounded-full bg-amo-orange/80 backdrop-blur-sm">{article.category}</span>
                <h2 className="text-3xl md:text-4xl font-bold mt-4 shadow-text">{article.title}</h2>
                <p className="mt-2 max-w-2xl text-gray-200 shadow-text">{article.excerpt}</p>
                <div className="flex items-center gap-4 mt-6">
                    <img src={article.author.avatarUrl} alt={article.author.name} className="w-10 h-10 rounded-full border-2 border-white" />
                    <div>
                        <p className="font-semibold">{article.author.name}</p>
                        <p className="text-sm text-gray-300">{article.date}</p>
                    </div>
                </div>
                 <button className="mt-6 bg-amo-orange text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-opacity-90 transition-all flex items-center gap-2">
                    Read More <ArrowRightIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

const ArticleCard: React.FC<{ article: Article }> = ({ article }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden">
            <div className="relative">
                <img src={article.imageUrl} alt={article.title} className="w-full h-48 object-cover aspect-video" />
                {article.isPlaceholder && (
                     <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white font-bold text-lg bg-amo-orange/80 px-4 py-2 rounded-full backdrop-blur-sm">Coming Soon 🌞</span>
                    </div>
                )}
            </div>
            <div className="p-6 flex flex-col flex-grow">
                <span className="text-xs font-bold px-2 py-1 rounded-full self-start mb-3 bg-orange-100 text-amo-orange">{article.category}</span>
                <h3 className="font-bold text-lg text-amo-dark flex-grow group-hover:text-amo-orange transition-colors">{article.title}</h3>
                {!article.isPlaceholder && <p className="text-sm text-gray-600 mt-2">{article.excerpt}</p>}
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                    <img src={article.author.avatarUrl} alt={article.author.name} className="w-8 h-8 rounded-full" />
                    <div>
                        <p className="text-sm font-semibold text-gray-800">{article.author.name}</p>
                        <p className="text-xs text-gray-500">{article.date}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};


const BlogScreen: React.FC<BlogScreenProps> = ({ articles, navigate }) => {
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const featuredArticle = articles.find(a => a.isFeatured);
    const regularArticles = articles.filter(a => !a.isFeatured);

    const filteredArticles = regularArticles.filter(article => {
        const matchesCategory = activeCategory === 'All' || article.category === activeCategory;
        const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="bg-amo-beige">
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
            `}</style>
            <PublicHeader navigate={navigate} />
            <main className="pt-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    {/* Header */}
                    <header className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold text-amo-dark">Blog</h1>
                        <p className="mt-2 text-lg text-gray-600 max-w-2xl mx-auto">Insights, tutorials, and stories from the AMO AI startup community.</p>
                    </header>

                    {/* Search and Filters */}
                    <section aria-label="Search and filter articles" className="my-8 max-w-4xl mx-auto">
                        <div className="relative">
                            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="search"
                                aria-label="Search articles"
                                placeholder="Search articles, topics, or founders…"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full py-3 pl-12 pr-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-amo-orange focus:border-transparent transition"
                            />
                        </div>
                        <div role="tablist" aria-label="Article categories" className="mt-4 flex flex-wrap justify-center gap-2">
                            {categories.map(category => (
                                <button
                                    key={category}
                                    role="tab"
                                    aria-selected={activeCategory === category}
                                    onClick={() => setActiveCategory(category)}
                                    className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                                        activeCategory === category
                                            ? 'bg-amo-orange text-white'
                                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                                    }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Featured Article */}
                    {featuredArticle && activeCategory === 'All' && searchQuery === '' && (
                        <section aria-label="Featured article" className="my-16">
                            <FeaturedArticleCard article={featuredArticle} />
                        </section>
                    )}

                    {/* Article Grid */}
                    <section aria-labelledby="latest-articles-heading" className="my-16">
                        <h2 id="latest-articles-heading" className="text-3xl font-bold text-amo-dark mb-8">{activeCategory === 'All' ? 'Latest from the Community' : `Showing articles in "${activeCategory}"`}</h2>
                        {filteredArticles.length > 0 ? (
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredArticles.map(article => (
                                    <ArticleCard key={article.id} article={article} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
                                <h3 className="text-xl font-bold text-amo-dark">No articles found</h3>
                                <p className="text-gray-600 mt-2">Try adjusting your search or filters.</p>
                            </div>
                        )}
                    </section>

                    {/* Pagination */}
                    <nav aria-label="Pagination" className="my-16 flex justify-center items-center gap-4 text-sm font-medium">
                        <button className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-50" disabled>← Previous</button>
                        <span className="px-4 py-2 rounded-lg bg-orange-100 text-amo-orange" aria-current="page">Page 1 of 5</span>
                        <button className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-100">Next →</button>
                    </nav>
                </div>
            </main>
            <Footer navigate={navigate} />
        </div>
    );
};

export default BlogScreen;