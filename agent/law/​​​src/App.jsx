import React, { useState } from 'react';
import { Search, Book, FileText, Scale, Landmark, ChevronRight, X, AlertCircle, ExternalLink, Lightbulb } from 'lucide-react'; 

export default function App() {
  const [keyword, setKeyword] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchHistory, setSearchHistory] = useState(['위험성평가', '안전관리비', '작업지시서', '품질관리']);

  const searchLawData = async (searchWord) => {
    if (!searchWord.trim()) return;
    setIsSearching(true);
    setKeyword(searchWord);
    
    try {
      const response = await fetch(`/api/search?keyword=${encodeURIComponent(searchWord)}`);
      if (!response.ok) throw new Error('네트워크 응답 에러');
      
      const data = await response.json();
      setResults(data);
      
      if (!searchHistory.includes(searchWord)) {
        setSearchHistory(prev => [searchWord, ...prev].slice(0, 5));
      }
    } catch (error) {
      console.error("검색 중 오류 발생:", error);
      alert("데이터를 불러오지 못했습니다.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') searchLawData(keyword);
  };

  const renderCard = (item, typeStr, icon) => (
    <div key={item.id} onClick={() => setSelectedItem({ ...item, type: typeStr })} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group flex flex-col h-full">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-1 rounded">{item.department}</span>
        <span className="text-xs text-slate-400">{item.date}</span>
      </div>
      <h4 className="font-bold text-slate-800 text-sm mb-2 group-hover:text-blue-600 leading-tight">{item.title}</h4>
      <p className="text-xs text-slate-500 line-clamp-3 mb-4 flex-grow">{item.summary}</p>
      <div className="flex items-center text-xs text-blue-500 font-medium mt-auto">
        상세보기 <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );

  const getOriginalLink = (item) => {
    if (!item) return "#";
    const baseUrl = item.type === '고시·행정규칙' ? 'https://www.law.go.kr/행정규칙/' : 'https://www.law.go.kr/법령/';
    return `${baseUrl}${item.title.replace(/ /g, '')}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-blue-200">
      <header className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-2 mb-10 opacity-90">
            <Landmark size={24} />
            <h1 className="text-xl font-bold tracking-tight">건설안전 법령 에이전트</h1>
          </div>
          
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">건설기술인을 위한 스마트 법령 검색</h2>
            <div className="relative flex items-center w-full max-w-2xl mx-auto mt-8">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input type="text" className="block w-full pl-12 pr-24 py-3 sm:py-4 border-0 rounded-2xl text-slate-900 ring-1 ring-inset ring-white focus:ring-2 focus:ring-inset focus:ring-blue-400 text-base sm:text-lg shadow-lg" placeholder="검색어 (예: 위험성평가)" value={keyword} onChange={(e) => setKeyword(e.target.value)} onKeyDown={handleKeyDown} />
              <button onClick={() => searchLawData(keyword)} className="absolute right-2 inset-y-2 bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 rounded-xl font-medium shadow-sm">검색</button>
            </div>
            
            <div className="mt-6 flex flex-wrap justify-center gap-2 px-2">
              <span className="text-sm text-blue-200 py-1 hidden sm:inline-block">핵심 키워드:</span>
              {searchHistory.map((term, idx) => (
                <button key={idx} onClick={() => searchLawData(term)} className="px-3 py-1 bg-white/10 hover:bg-white/20 text-blue-50 rounded-full text-xs sm:text-sm border border-white/20">{term}</button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-20">
        {isSearching ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 flex flex-col items-center justify-center min-h-[300px]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-slate-500">데이터를 분석 중입니다...</p>
          </div>
        ) : results ? (
          <div className="space-y-6">
            
            {results.briefing && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-sm border border-blue-100 p-5 sm:p-6 mb-6">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                    <Lightbulb size={20} />
                  </div>
                  <h3 className="font-bold text-blue-900 text-lg">에이전트 핵심 브리핑</h3>
                </div>
                <p className="text-blue-900 leading-relaxed font-medium sm:text-lg">
                  {results.briefing}
                </p>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row items-center sm:justify-between gap-4">
              <div className="flex items-center font-medium text-center">
                <span className="text-blue-600 font-bold text-lg mr-2 break-keep">"{keyword}"</span>
                <span className="whitespace-nowrap">법령 목록입니다.</span>
              </div>
              <div className="flex flex-wrap justify-center gap-3 sm:gap-6 text-sm text-slate-600 bg-slate-50 py-2 px-4 rounded-lg">
                <span>법률 <b className="text-slate-900">{results.law.length}</b></span>
                <span>시행령 <b className="text-slate-900">{results.decree.length}</b></span>
                <span>규칙 <b className="text-slate-900">{results.rule.length}</b></span>
                <span>고시 <b className="text-slate-900">{results.notice.length}</b></span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                { key: 'law', title: '법률', icon: <Scale size={20}/>, iconSmall: <Scale size={16}/>, color: 'slate' },
                { key: 'decree', title: '시행령', icon: <Book size={20}/>, iconSmall: <Book size={16}/>, color: 'blue' },
                { key: 'rule', title: '시행규칙', icon: <FileText size={20}/>, iconSmall: <FileText size={16}/>, color: 'indigo' },
                { key: 'notice', title: '고시·행정규칙', icon: <AlertCircle size={20}/>, iconSmall: <AlertCircle size={16}/>, color: 'emerald' }
              ].map(col => (
                <div key={col.key} className="flex flex-col">
                  <div className={`flex items-center space-x-2 mb-3 px-1 text-${col.color}-700`}>
                    {col.icon}
                    <h3 className="font-bold text-slate-800 text-lg">{col.title}</h3>
                  </div>
                  <div className={`bg-${col.color}-50/50 rounded-2xl p-4 flex-grow flex flex-col gap-4 border border-${col.color}-100`}>
                    {results[col.key].length > 0 ? results[col.key].map(item => renderCard(item, col.title, col.iconSmall)) : (
                      <div className="text-center text-slate-400 text-sm py-10 bg-white/50 rounded-xl">검색 결과 없음</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
           <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-12 md:p-16 border border-slate-200 text-center flex flex-col items-center">
            <div className="bg-blue-50 p-4 rounded-full mb-6">
              <Landmark className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-2">실시간 법령 조회를 시작하세요</h3>
          </div>
        )}
      </main>

      {/* 모달 창 */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-3xl max-h-[90vh] sm:max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex flex-col pr-4">
                <span className="text-xs font-bold text-blue-600 mb-1">{selectedItem.type}</span>
                <h2 className="text-lg sm:text-xl font-bold text-slate-800 leading-tight">{selectedItem.title}</h2>
              </div>
              <button onClick={() => setSelectedItem(null)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full"><X size={24} /></button>
            </div>
            <div className="p-5 overflow-y-auto flex-grow bg-slate-50">
              <div className="flex gap-3 mb-5 text-sm">
                <div className="bg-white p-3 rounded-xl border border-slate-200 flex-1">
                  <span className="block text-slate-500 mb-1 text-[11px]">소관부처</span>
                  <span className="font-bold text-slate-800">{selectedItem.department}</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 flex-1">
                  <span className="block text-slate-500 mb-1 text-[11px]">시행일자</span>
                  <span className="font-bold text-slate-800">{selectedItem.date}</span>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-white sm:rounded-b-2xl flex flex-col sm:flex-row justify-end gap-2">
              <button onClick={() => setSelectedItem(null)} className="w-full sm:w-auto px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium order-2 sm:order-1">닫기</button>
              <a href={getOriginalLink(selectedItem)} target="_blank" rel="noreferrer" className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white flex items-center justify-center rounded-xl font-medium order-1 sm:order-2">
                국가법령 원문 보기 <ExternalLink size={16} className="ml-2" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
