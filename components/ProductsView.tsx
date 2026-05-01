import React, { useState, useMemo } from 'react';
import type { Product } from '../types';
import Modal from './Modal';
import InputField from './common/InputField';
import Pagination from './common/Pagination';
import { GoogleGenAI, Type } from '@google/genai';

interface ProductsViewProps {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Omit<Product, 'id'>) => void;
  deleteProduct: (id: string) => void;
  onBatchUpdate: (productIds: string[], discountPercent: number) => void;
}

const ITEMS_PER_PAGE = 10;

// Reusable Stat Card component
const StatCard = ({ title, value, icon, valueClassName }: { title: string; value: string | number; icon: string; valueClassName?: string }) => (
    <div className="bg-slate-50 p-4 rounded-xl shadow-sm flex items-center gap-4 border border-slate-200">
        <div className={`p-3 rounded-full ${valueClassName} bg-opacity-10`}>
            <span className={`material-symbols-outlined text-3xl ${valueClassName}`}>{icon}</span>
        </div>
        <div>
            <h3 className="text-slate-500 text-sm">{title}</h3>
            <p className={`text-xl font-bold ${valueClassName || 'text-slate-800'}`}>{value}</p>
        </div>
    </div>
);


const ProductsView: React.FC<ProductsViewProps> = ({ products, addProduct, updateProduct, deleteProduct, onBatchUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [priceStatusFilter, setPriceStatusFilter] = useState<'all' | 'zero' | 'with-price'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [discountPercent, setDiscountPercent] = useState('');
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  const totalUniqueProducts = useMemo(() => products.length, [products]);

  const categories = useMemo(() => {
      const cats = new Set<string>();
      products.forEach(p => {
          if (p.category) cats.add(p.category);
      });
      return Array.from(cats).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        const lowerSearchTerm = searchTerm.toLowerCase();
        const matchesSearch = p.name.toLowerCase().includes(lowerSearchTerm) ||
          p.description?.toLowerCase().includes(lowerSearchTerm) ||
          p.category?.toLowerCase().includes(lowerSearchTerm);
        
        if (!matchesSearch) return false;

        if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;

        if (minPrice !== '' && p.price < parseFloat(minPrice)) return false;
        if (maxPrice !== '' && p.price > parseFloat(maxPrice)) return false;

        if (priceStatusFilter === 'zero' && p.price !== 0) return false;
        if (priceStatusFilter === 'with-price' && p.price <= 0) return false;

        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [products, searchTerm, categoryFilter, minPrice, maxPrice]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const handleOpenModal = (product: Product | null = null) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingProduct(null);
    setIsModalOpen(false);
  };

  const handleSave = (productData: Omit<Product, 'id'>) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      addProduct(productData);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      deleteProduct(id);
    }
  };
  
  const handleSelectProduct = (id: string) => {
    setSelectedProducts(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        return newSet;
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
        setSelectedProducts(new Set(paginatedProducts.map(p => p.id)));
    } else {
        setSelectedProducts(new Set());
    }
  };

  const handleApplyDiscount = () => {
    const discount = parseFloat(discountPercent);
    if (selectedProducts.size === 0) {
        alert("الرجاء تحديد منتج واحد على الأقل.");
        return;
    }
    if (isNaN(discount) || discount < 0 || discount > 100) {
        alert("الرجاء إدخال نسبة خصم صالحة بين 0 و 100.");
        return;
    }
    onBatchUpdate(Array.from(selectedProducts), discount);
    setDiscountPercent('');
    setSelectedProducts(new Set());
  };

  const clearFilters = () => {
      setSearchTerm('');
      setCategoryFilter('all');
      setMinPrice('');
      setMaxPrice('');
      setPriceStatusFilter('all');
      setCurrentPage(1);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
      <div className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-white flex justify-between items-center gap-4">
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                    className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors font-medium text-sm"
                >
                    <span className="material-symbols-outlined">filter_list</span>
                    تصفية
                    <span className={`material-symbols-outlined transition-transform ${isFilterExpanded ? 'rotate-180' : ''}`}>expand_more</span>
                </button>
            </div>
            <button onClick={() => handleOpenModal()} className="flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-sm">
                <span className="material-symbols-outlined">add</span>
                إضافة منتج
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-4 p-6 bg-slate-50 border-b border-slate-100">
            <StatCard title="إجمالي الأصناف" value={totalUniqueProducts} icon="inventory_2" valueClassName="text-indigo-600" />
        </div>
        
        <div className={`bg-slate-50 p-6 border-b border-slate-200 transition-all duration-300 ${isFilterExpanded ? 'block' : 'hidden'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">بحث</label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            type="text"
                            placeholder="الاسم، الوصف، التصنيف..."
                            value={searchTerm}
                            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="w-full pl-3 pr-10 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">التصنيف</label>
                    <select 
                        value={categoryFilter} 
                        onChange={e => { setCategoryFilter(e.target.value); setCurrentPage(1); }} 
                        className="w-full p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
                    >
                        <option value="all">كل التصنيفات</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
                <div className="flex gap-2">
                    <div className="flex-1">
                        <label className="block text-xs font-semibold text-slate-500 mb-1">أقل سعر</label>
                        <input
                            type="number"
                            placeholder="0.00"
                            value={minPrice}
                            onChange={e => { setMinPrice(e.target.value); setCurrentPage(1); }}
                            className="w-full p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs font-semibold text-slate-500 mb-1">أعلى سعر</label>
                        <input
                            type="number"
                            placeholder="1000.00"
                            value={maxPrice}
                            onChange={e => { setMaxPrice(e.target.value); setCurrentPage(1); }}
                            className="w-full p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">حالة السعر</label>
                    <select 
                        value={priceStatusFilter} 
                        onChange={e => { setPriceStatusFilter(e.target.value as any); setCurrentPage(1); }} 
                        className="w-full p-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
                    >
                        <option value="all">كل الحالات</option>
                        <option value="zero">أصناف بدون سعر (مجاني/0)</option>
                        <option value="with-price">أصناف بأسعار محددة</option>
                    </select>
                </div>
                <div className="lg:col-span-4 flex justify-end">
                    <button 
                        onClick={clearFilters}
                        className="text-slate-500 hover:text-slate-800 text-sm font-medium px-4 py-2 transition-colors"
                    >
                        مسح التصفية
                    </button>
                </div>
            </div>
        </div>

        {selectedProducts.size > 0 && (
             <div className="p-4 bg-indigo-50 border-b border-indigo-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="font-semibold text-indigo-800 flex items-center gap-2">
                    <span className="material-symbols-outlined">check_circle</span>
                    {selectedProducts.size} منتجات محددة
                </span>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input type="number" value={discountPercent} onChange={e => setDiscountPercent(e.target.value)} placeholder="نسبة الخصم %" className="w-32 p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
                    <button onClick={handleApplyDiscount} className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">تطبيق</button>
                    <button onClick={() => onBatchUpdate(Array.from(selectedProducts), 0)} className="bg-white text-slate-700 border border-slate-300 font-bold py-2 px-4 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">إلغاء الخصم</button>
                </div>
            </div>
        )}
        <div className="overflow-x-auto w-full">
            <table className="w-full text-right border-collapse min-w-[800px]">
                <thead>
                    <tr className="bg-slate-50 text-slate-500 border-y border-slate-200 text-xs uppercase font-bold tracking-wider">
                        <th className="py-4 px-4 w-12 text-center">
                            <input type="checkbox" onChange={handleSelectAll} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer" />
                        </th>
                        <th className="py-4 px-4 w-20 text-center">الصورة</th>
                        <th className="py-4 px-4 text-right">المنتج</th>
                        <th className="py-4 px-4 text-center">النوع</th>
                        <th className="py-4 px-4 text-left">السعر</th>
                        <th className="py-4 px-4 text-center w-28">الإجراءات</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                    {paginatedProducts.map((p) => (
                        <tr key={p.id} className={`hover:bg-indigo-50/30 transition-colors group ${selectedProducts.has(p.id) ? 'bg-indigo-50/50' : ''}`}>
                            <td className="py-3 px-4 text-center align-middle">
                                <input type="checkbox" checked={selectedProducts.has(p.id)} onChange={() => handleSelectProduct(p.id)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer" />
                            </td>
                            <td className="py-3 px-4 text-center align-middle">
                                <div className="relative group/img w-14 h-14 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-200 mx-auto group-hover:border-indigo-200 transition-all shadow-sm cursor-zoom-in">
                                    {p.image ? (
                                        <>
                                            <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-110" referrerPolicy="no-referrer" />
                                            {/* Large preview on hover */}
                                            <div className="fixed hidden group-hover/img:block z-[100] transform -translate-x-full -translate-y-1/2 p-2 bg-white rounded-2xl shadow-2xl border border-slate-200 w-64 h-64 pointer-events-none">
                                                <img src={p.image} alt={p.name} className="w-full h-full object-cover rounded-xl" />
                                                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent text-white text-xs font-bold rounded-b-xl">
                                                    {p.name}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <span className="material-symbols-outlined text-slate-300 text-[28px]">image</span>
                                    )}
                                </div>
                            </td>
                            <td className="py-3 px-4 text-right align-middle">
                                <div>
                                    <div className="font-bold text-slate-800 text-sm group-hover:text-indigo-700 transition-colors">{p.name}</div>
                                    {p.category && <div className="text-xs text-slate-400 mt-0.5">{p.category}</div>}
                                </div>
                            </td>
                            <td className="py-3 px-4 text-center align-middle">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide ${p.type === 'service' ? 'bg-sky-100 text-sky-700 border border-sky-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                                    {p.type === 'service' ? 'خدمة' : 'منتج'}
                                </span>
                            </td>
                            <td className="py-3 px-4 text-left align-middle">
                                {p.salePrice ? (
                                    <div className="flex flex-col items-end">
                                        <span className="line-through text-slate-400 text-[11px] font-mono">${p.price.toFixed(2)}</span>
                                        <span className="font-bold text-emerald-600 text-sm font-mono">${p.salePrice.toFixed(2)}</span>
                                    </div>
                                ) : p.discountPercent ? (
                                    <div className="flex flex-col items-end">
                                        <span className="line-through text-slate-400 text-[11px] font-mono">${p.price.toFixed(2)}</span>
                                        <div className="flex items-center gap-1.5 justify-end">
                                            <span className="font-bold text-orange-600 text-sm font-mono">${(p.price * (1 - p.discountPercent / 100)).toFixed(2)}</span>
                                            <span className="text-[10px] bg-orange-100 text-orange-700 px-1 py-0.5 rounded font-bold">-{p.discountPercent}%</span>
                                        </div>
                                    </div>
                                ) : (
                                    <span className="font-bold text-slate-800 text-sm font-mono">${p.price.toFixed(2)}</span>
                                )}
                            </td>
                            <td className="py-3 px-4 text-center align-middle">
                                <div className="flex items-center justify-center gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 transform sm:-translate-x-2 sm:group-hover:translate-x-0">
                                    <button onClick={() => handleOpenModal(p)} className="p-1.5 rounded-lg text-slate-400 hover:bg-white hover:text-indigo-600 hover:shadow-sm border border-transparent hover:border-slate-200 transition-all bg-slate-50" title="تعديل">
                                        <span className="material-symbols-outlined text-[18px] block">edit</span>
                                    </button>
                                    <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg text-slate-400 hover:bg-white hover:text-red-600 hover:shadow-sm border border-transparent hover:border-slate-200 transition-all bg-slate-50" title="حذف">
                                        <span className="material-symbols-outlined text-[18px] block">delete</span>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {filteredProducts.length === 0 && (
                <div className="text-center py-16 px-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-400 mb-4">
                        <span className="material-symbols-outlined text-3xl">search_off</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 mb-1">لا توجد منتجات</h3>
                    <p className="text-slate-500">لم يتم العثور على منتجات تطابق معايير البحث الحالية.</p>
                </div>
            )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} itemsPerPage={ITEMS_PER_PAGE} totalItems={filteredProducts.length} />
        </div>
      </div>
      {isModalOpen && <ProductModal product={editingProduct} onClose={handleCloseModal} onSave={handleSave} />}
    </div>
  );
};


const ProductModal: React.FC<{
  product: Product | null;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id'>) => void;
}> = ({ product, onClose, onSave }) => {
  const [name, setName] = useState(product?.name || '');
  const [type, setType] = useState<Product['type']>(product?.type || 'product');
  const [description, setDescription] = useState(product?.description || '');
  const [price, setPrice] = useState(product?.price.toString() || '');
  const [cost, setCost] = useState(product?.cost?.toString() || '');
  const [salePrice, setSalePrice] = useState(product?.salePrice?.toString() || '');
  const [discountPercent, setDiscountPercent] = useState(product?.discountPercent?.toString() || '');
  const [category, setCategory] = useState(product?.category || '');
  const [image, setImage] = useState(product?.image || '');
  const [modifiers, setModifiers] = useState<{name: string, price: number}[]>(product?.availableModifiers || []);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isAutofilling, setIsAutofilling] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) { // 500KB limit for localStorage
        alert('حجم الصورة كبير جداً. يرجى اختيار صورة أقل من 500 كيلوبايت.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAutofill = async () => {
     if (!name) return;
     setIsAutofilling(true);
     try {
         // This is a placeholder for the actual AI autofill logic
         // For now, we'll just simulate a delay
         await new Promise(resolve => setTimeout(resolve, 1500));
         console.log("Autofilling for:", name);
     } catch (error) {
         console.error("Autofill failed:", error);
     } finally {
         setIsAutofilling(false);
     }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};
    if (!name.trim()) newErrors.name = 'اسم المنتج مطلوب.';
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) newErrors.price = 'السعر يجب أن يكون رقماً موجباً.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSave({
      name, description, category, type, image,
      price: parseFloat(price),
      cost: cost ? parseFloat(cost) : undefined,
      salePrice: salePrice ? parseFloat(salePrice) : undefined,
      discountPercent: discountPercent ? parseFloat(discountPercent) : undefined,
      availableModifiers: modifiers.length > 0 ? modifiers : undefined,
    });
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={product ? 'تعديل منتج' : 'إضافة منتج/خدمة'} size="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col xl:flex-row gap-8">
                {/* Right Column: Main Info */}
                <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField id="name" label="اسم المنتج/الخدمة" value={name} onChange={e => setName(e.target.value)} error={errors.name} />
                        <div>
                            <label htmlFor="type" className="block text-slate-700 text-sm font-bold mb-2">نوع العنصر</label>
                            <select id="type" value={type} onChange={e => setType(e.target.value as Product['type'])} className="w-full p-2 border rounded-lg bg-white border-slate-300 h-[42px] focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all">
                                <option value="product">منتج مادي</option>
                                <option value="service">خدمة</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField id="category" label="التصنيف (اختياري)" value={category} onChange={e => setCategory(e.target.value)} />
                        <div className="flex items-end mb-4">
                           <button 
                                type="button" 
                                onClick={handleAutofill} 
                                disabled={isAutofilling || !name}
                                className="w-full flex items-center justify-center gap-2 bg-slate-800 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-900 transition-colors disabled:opacity-50 h-[42px]"
                            >
                                <span className="material-symbols-outlined text-[18px]">{isAutofilling ? 'sync' : 'auto_fix'}</span>
                                {isAutofilling ? 'جاري التحليل...' : 'تعبئة ذكية بالذكاء الاصطناعي'}
                            </button>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <InputField id="price" label="سعر البيع" value={price} onChange={e => setPrice(e.target.value)} error={errors.price} type="number" />
                        <InputField id="cost" label="التكلفة (اختياري)" value={cost} onChange={e => setCost(e.target.value)} type="number" />
                        <InputField id="salePrice" label="سعر العرض" value={salePrice} onChange={e => setSalePrice(e.target.value)} type="number" />
                        <InputField id="discountPercent" label="نسبة الخصم %" value={discountPercent} onChange={e => setDiscountPercent(e.target.value)} type="number" />
                    </div>
                </div>

                {/* Left Column: Image & Media */}
                <div className="w-full xl:w-64 space-y-4">
                    <label className="block text-slate-700 text-sm font-bold">صورة المنتج</label>
                    <div className="relative group aspect-square rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden hover:border-indigo-300 transition-all shadow-inner">
                        {image ? (
                            <>
                                <img src={image} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button 
                                        type="button"
                                        onClick={() => setImage('')}
                                        className="bg-white/20 backdrop-blur-md text-white p-2 rounded-xl border border-white/30 hover:bg-red-500/80 transition-all"
                                        title="حذف الصورة"
                                    >
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="text-center p-6 bg-white/50 w-full h-full flex flex-col items-center justify-center">
                                <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center mb-3">
                                    <span className="material-symbols-outlined text-3xl">add_a_photo</span>
                                </div>
                                <p className="text-xs font-bold text-slate-600 mb-1">رفع صورة المنتج</p>
                                <p className="text-[10px] text-slate-400">PNG, JPG حتى 500KB</p>
                            </div>
                        )}
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                {/* Modifiers Section */}
                <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h4 className="text-slate-800 font-bold text-sm">الإضافات والخيارات</h4>
                            <p className="text-[10px] text-slate-500">مثل: صوص إضافي، جبنة، حجم كبير...</p>
                        </div>
                        <button type="button" onClick={() => setModifiers([...modifiers, {name: '', price: 0}])} className="text-xs bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 font-bold transition-all flex items-center gap-1 shadow-sm">
                            <span className="material-symbols-outlined text-[16px]">add</span>
                            إضافة خيار
                        </button>
                    </div>
                    
                    <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {modifiers.length > 0 ? (
                            modifiers.map((mod, index) => (
                                <div key={index} className="flex gap-2 items-center bg-white p-2 rounded-xl border border-slate-200 shadow-sm animate-[slide-in_0.2s_ease-out]">
                                    <input 
                                        type="text" 
                                        placeholder="اسم الإضافة" 
                                        value={mod.name}
                                        onChange={(e) => {
                                            const newMods = [...modifiers];
                                            newMods[index].name = e.target.value;
                                            setModifiers(newMods);
                                        }}
                                        className="flex-1 p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                    <div className="relative w-28">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                                        <input 
                                            type="number" 
                                            placeholder="0.00" 
                                            value={mod.price === 0 && !mod.name ? '' : mod.price}
                                            onChange={(e) => {
                                                const newMods = [...modifiers];
                                                newMods[index].price = parseFloat(e.target.value) || 0;
                                                setModifiers(newMods);
                                            }}
                                            className="w-full pl-6 pr-2 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                    <button type="button" onClick={() => {
                                        const newMods = [...modifiers];
                                        newMods.splice(index, 1);
                                        setModifiers(newMods);
                                    }} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                        <span className="material-symbols-outlined text-[20px]">delete</span>
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl bg-white/50">
                                <span className="material-symbols-outlined text-slate-200 text-4xl mb-2">list_alt</span>
                                <p className="text-xs text-slate-400 font-medium">لا توجد إضافات لهذا المنتج</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Description Section */}
                <div className="flex flex-col">
                    <label htmlFor="description" className="block text-slate-700 text-sm font-bold mb-2">وصف المنتج</label>
                    <textarea 
                        id="description"
                        value={description} 
                        onChange={e => setDescription(e.target.value)}
                        placeholder="أدخل وصفاً تفصيلياً للمنتج أو الخدمة..."
                        className="flex-1 w-full p-4 border border-slate-300 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[150px] resize-none text-sm transition-all"
                    />
                </div>
            </div>
        
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
          <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-colors">إلغاء</button>
          <button type="submit" className="px-8 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5 active:translate-y-0">حفظ التغييرات</button>
        </div>
      </form>
    </Modal>
  );
};

export default ProductsView;