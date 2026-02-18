export default function Location() {
  return (
    <section id="location" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-text-dark mb-4">오시는 길</h2>
        <p className="text-center text-text-mid mb-12">강원도 평창군 대관령면 솔봉로 397</p>

        {/* Map Placeholder */}
        <div className="w-full h-80 rounded-2xl bg-gradient-to-br from-sage/30 to-primary/10 flex items-center justify-center mb-12 shadow-inner">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-sage/50 flex items-center justify-center">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-text-mid font-medium">지도 영역</p>
            <p className="text-sm text-text-light mt-1">강원도 평창군 대관령면 솔봉로 397</p>
          </div>
        </div>

        {/* Directions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Car */}
          <div className="bg-sage/10 rounded-2xl p-6 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-sage/30 flex items-center justify-center">
              <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10m10 0H3m10 0h4.68a1 1 0 01.98.8l.44 2.2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-dark mb-2">자가용</h3>
            <p className="text-text-mid text-sm leading-relaxed">
              영동고속도로 대관령IC에서<br />
              <span className="font-semibold text-primary">약 15분 소요</span>
            </p>
          </div>

          {/* Public Transit */}
          <div className="bg-sage/10 rounded-2xl p-6 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-sage/30 flex items-center justify-center">
              <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h4a2 2 0 002-2V7M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M8 7h8m-4 4h.01" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-dark mb-2">대중교통</h3>
            <p className="text-text-mid text-sm leading-relaxed">
              서울 → 훡계 시외버스<br />
              <span className="font-semibold text-primary">약 2시간 30분 소요</span>
            </p>
          </div>

          {/* Shuttle Bus */}
          <div className="bg-sage/10 rounded-2xl p-6 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-sage/30 flex items-center justify-center">
              <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-dark mb-2">셔틀버스</h3>
            <p className="text-text-mid text-sm leading-relaxed">
              훡계터미널 출발<br />
              <span className="font-semibold text-primary">10:00 / 14:00 / 18:00</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}