export default async function handler(req, res) {
  const keyword = req.query.keyword ? req.query.keyword.trim() : '';
  const LAW_API_ID = 'lawagent123'; 

  if (!keyword) {
    return res.status(400).json({ error: '검색어가 필요합니다.' });
  }

  const smartDict = {
    "위험성평가": { 
      law: "산업안전보건", 
      notice: "사업장 위험성평가에 관한 지침",
      briefing: "위험성평가는 「산업안전보건법 제36조」에 따라 사업주가 의무적으로 실시해야 하며, 세부적인 실시 절차 및 방법은 고용노동부 고시인 「사업장 위험성평가에 관한 지침」을 준수하여 이행해야 합니다."
    },
    "안전관리비": { 
      law: "산업안전보건", 
      notice: "건설업 산업안전보건관리비 계상 및 사용기준",
      briefing: "산업안전보건관리비는 「산업안전보건법 제72조」에 근거하여 도급인이 건설공사 계약 시 계상해야 하며, 구체적인 사용 기준은 관련 고시를 따릅니다."
    },
    "작업지시서": { 
      law: "산업안전보건기준", 
      notice: "작업지시서",
      briefing: "사전조사 및 작업계획서 작성은 「산업안전보건기준에 관한 규칙 제38조」에 명시되어 있으며, 중대재해 예방을 위한 핵심 서류입니다."
    },
    "중대재해": { 
      law: "중대재해", 
      notice: "중대재해",
      briefing: "중대재해는 「중대재해 처벌 등에 관한 법률」에 따라 사업주와 경영책임자의 안전보건 확보 의무를 엄격히 규정하고 있습니다."
    },
    "품질관리": { 
      law: "건설기술 진흥", 
      notice: "건설공사 품질관리 업무지침",
      briefing: "건설공사 품질관리는 「건설기술 진흥법 제55조」에 따라 품질관리계획을 수립해야 하며, 세부 사항은 품질관리 업무지침 고시를 따릅니다."
    }
  };

  const searchLawWord = smartDict[keyword]?.law || keyword;
  const searchNoticeWord = smartDict[keyword]?.notice || keyword;
  const briefingText = smartDict[keyword]?.briefing || null;

  try {
    const fetchOptions = {
      headers: {
        'Referer': 'https://lawagent123.vercel.app/',
        'Origin': 'https://lawagent123.vercel.app',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    const lawUrl = `https://www.law.go.kr/DRF/lawSearch.do?OC=${LAW_API_ID}&target=law&type=JSON&display=100&query=${encodeURIComponent(searchLawWord)}`;
    const lawResponse = await fetch(lawUrl, fetchOptions);
    const lawText = await lawResponse.text();
    
    let lawData;
    try { lawData = JSON.parse(lawText); } 
    catch (e) { return res.status(500).json({ error: '국가법령 서버 응답 오류', details: lawText.substring(0, 200) }); }

    const noticeUrl = `https://www.law.go.kr/DRF/lawSearch.do?OC=${LAW_API_ID}&target=admrul&type=JSON&display=100&query=${encodeURIComponent(searchNoticeWord)}`;
    const noticeResponse = await fetch(noticeUrl, fetchOptions);
    const noticeText = await noticeResponse.text();
    const noticeData = JSON.parse(noticeText);

    const categorizedData = { 
      briefing: briefingText, 
      law: [], decree: [], rule: [], notice: [] 
    };

    if (lawData?.LawSearch?.law) {
      const laws = Array.isArray(lawData.LawSearch.law) ? lawData.LawSearch.law : [lawData.LawSearch.law];
      laws.forEach(item => {
        const typeName = item.법령구분명 || ''; 
        const formattedItem = { id: item.법령일련번호, title: item.법령명한글, date: item.시행일자, department: item.소관부처명, summary: `[${typeName}] 상세 내용은 원문을 확인하세요.` };
        if (typeName.includes('법률')) categorizedData.law.push(formattedItem);
        else if (typeName.includes('대통령령')) categorizedData.decree.push(formattedItem);
        else if (typeName.includes('부령') || typeName.includes('총리령')) categorizedData.rule.push(formattedItem);
      });
    }

    const admrulRoot = noticeData?.AdmRulSearch || noticeData?.AdmrulSearch;
    if (admrulRoot?.admrul) {
      const notices = Array.isArray(admrulRoot.admrul) ? admrulRoot.admrul : [admrulRoot.admrul];
      notices.forEach(item => {
        categorizedData.notice.push({ id: item.행정규칙일련번호, title: item.행정규칙명, date: item.발령일자, department: item.소관부처명, summary: `[${item.행정규칙종류명 || '행정규칙'}] 발령번호: ${item.발령번호}` });
      });
    }

    res.status(200).json(categorizedData);
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: '서버 내부 에러 발생', details: String(error) });
  }
}
