    // ============================================================
    // index.js — HoangViet Motors (BẢN VẠN NĂNG THẾ HỆ MỚI - SỬA LỖI TRỘN KHUNG)
    // ============================================================

    const EMAILJS_PUBLIC_KEY  = '5v8sWjS44vREWeUw9';
    const EMAILJS_SERVICE_ID  = 'service_ree9v7t';
    const EMAILJS_TEMPLATE_ID = 'template_zsgcjoe';

    (function autoLoadEmailJS() {
        if (typeof emailjs === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
            script.async = true;
            document.head.appendChild(script);
        }
    })();

    // ============================================================
    // 1. HÀM TRỢ GIÚP ĐỌC/GHI VẠN NĂNG (CHỐNG LỖI THẺ HTML)
    // ============================================================
    function priceFormat(x) {
        x = Math.floor(x);
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    const unformat = s => {
        if (!s) return 0;
        return parseInt(String(s).replace(/[^0-9]/g, '')) || 0;
    };

    function getContent(el) {
        if (!el) return '';
        return el.value !== undefined ? el.value : el.textContent;
    }

    function setContent(el, val) {
        if (!el) return;
        if (el.value !== undefined) {
            el.value = val;
        } else {
            el.textContent = val;
        }
    }

    // ============================================================
    // 2. DOM SELECTORS AN TOÀN (CÔ LẬP TUYỆT ĐỐI - KHÔNG ĐỤNG Ô HỌ TÊN)
    // ============================================================
    const getLoanInput = () => 
        document.getElementById('loan-input') || 
        document.querySelector('.loan-input') || 
        document.querySelector('.text-input-loan') ||
        document.querySelector('.calculator-box input[type="text"]'); 
        // KHÔNG dùng input[type="text"] chung chung ở đây nữa để tránh lấy nhầm ô Họ Tên

    const getLoanSlider = () => 
        document.getElementById('loan-slider') ||
        document.querySelector('.loan-slider') ||
        document.querySelectorAll('input[type="range"]')[0];

    const getTermSlider = () => 
        document.getElementById('term-slider') ||
        document.querySelector('.term-slider') ||
        document.querySelectorAll('input[type="range"]')[1];

    const getLoanDisp = () => 
        document.getElementById('loan-disp') ||
        document.querySelector('.loan-display-val') ||
        document.querySelector('.field:nth-of-type(2) .field-label .val');

    const getTermDisp = () => 
        document.getElementById('term-disp') ||
        document.querySelector('.term-display-val') ||
        document.querySelector('.field:nth-of-type(3) .field-label .val');

    const getResultBox = () => 
        document.getElementById('result-box-val') ||
        document.querySelector('.result-box-val') || 
        document.querySelector('.monthly-payment') ||
        document.querySelector('.result-box');

    // ============================================================
    // 3. HÀM TÍNH TOÁN CHÍNH (CƠ CHẾ ĐỌC DỰ PHÒNG THÔNG MINH)
    // ============================================================
    function calc() {
        const loanInputEl  = getLoanInput();
        const loanSliderEl = getLoanSlider();
        const termSliderEl = getTermSlider();
        const resultBoxEl  = getResultBox();

        // Lấy số tiền: Ưu tiên ô nhập chữ, nếu không có thì lấy trực tiếp từ thanh kéo Slider
        let loan = 0;
        if (loanInputEl) {
            loan = unformat(getContent(loanInputEl));
        } else if (loanSliderEl) {
            loan = +loanSliderEl.value || 0;
        }

        const term = termSliderEl ? (+termSliderEl.value || 12) : 12; 

        const ANNUAL_RATE = 38.4 / 100; 
        const r = ANNUAL_RATE / 12;     

        let monthly_payment = 0;
        let total_payment = 0;

        if (loan > 0) {
            // Công thức PMT chuẩn ngân hàng
            monthly_payment = (loan * r) / (1 - Math.pow(1 + r, -term));
            total_payment = monthly_payment * term;
        }

        // 1. Hiển thị Khoản thanh toán hằng tháng lên đúng khung kết quả
        if (resultBoxEl) {
            if (loan >= 5000000) {
                setContent(resultBoxEl, priceFormat(monthly_payment) + ' VNĐ');
            } else {
                setContent(resultBoxEl, '—');
            }
        }

        // 2. Tự động đính kèm dòng chữ Tổng số tiền cuối kỳ ngay bên dưới khung kết quả
        if (resultBoxEl && resultBoxEl.parentElement) {
            let totalDispEl = document.querySelector('.total-pay-append');
            if (!totalDispEl) {
                totalDispEl = document.createElement('div');
                totalDispEl.className = 'total-pay-append';
                totalDispEl.style.cssText = 'font-size:14px;color:#333;margin-top:10px;font-weight:bold;text-align:center;display:block;';
                resultBoxEl.after(totalDispEl);
            }
        }

        // 3. Đồng bộ vào form liên hệ ngầm (nếu có hệ thống lưu database ẩn)
        const amountLoanInput = document.querySelector('.contact-for-loan .amount_loan');
        const monthLoanInput  = document.querySelector('.contact-for-loan .month_loan');
        const totalLoanInput  = document.querySelector('.contact-for-loan .total_loan');
        const rateLoanInput   = document.querySelector('.contact-for-loan .rate_loan');

        if (amountLoanInput) amountLoanInput.value = loan;
        if (monthLoanInput)  monthLoanInput.value  = term;
        if (totalLoanInput)  totalLoanInput.value  = Math.floor(total_payment);
        if (rateLoanInput)   rateLoanInput.value   = "38.4%";
    }

    // ============================================================
    // 4. XỬ LÝ SỰ KIỆN GÕ PHÍM & KÉO THANH TRƯỢT
    // ============================================================
    function onLoanInput() {
        let v = unformat(this.value !== undefined ? this.value : this.textContent);
        let formatted = v === 0 ? '' : priceFormat(v);
        
        if (this.value !== undefined) this.value = formatted;
        else this.textContent = formatted;

        const loanSliderEl = getLoanSlider();
        if (loanSliderEl && v >= 5000000 && v <= 100000000) {
            loanSliderEl.value = Math.round(v / 5000000) * 5000000;
            applyFill(loanSliderEl);
        }
        calc(); 
    }

    function onLoanChange() {
        let v = unformat(this.value !== undefined ? this.value : this.textContent);
        v = Math.round(v / 5000000) * 5000000;
        v = Math.min(Math.max(v, 5000000), 100000000); 

        let formatted = priceFormat(v);
        if (this.value !== undefined) this.value = formatted;
        else this.textContent = formatted;
        
        const loanSliderEl = getLoanSlider();
        const loanDispEl   = getLoanDisp();
        if (loanSliderEl) { loanSliderEl.value = v; applyFill(loanSliderEl); }
        if (loanDispEl)   setContent(loanDispEl, formatted + ' VNĐ');
        calc();
    }

    function onLoanSlide() {
        const loanSliderEl = getLoanSlider();
        const loanInputEl  = getLoanInput();
        const loanDispEl   = getLoanDisp();
        if (!loanSliderEl) return;

        const v = +loanSliderEl.value; 
        if (loanInputEl) setContent(loanInputEl, priceFormat(v));
        if (loanDispEl)  setContent(loanDispEl, priceFormat(v) + ' VNĐ');
        applyFill(loanSliderEl);
        calc();
    }

    function onTerm() {
        const termSliderEl = getTermSlider();
        const termDispEl   = getTermDisp();
        if (!termSliderEl) return;

        const v = +termSliderEl.value;
        if (termDispEl) setContent(termDispEl, v + ' tháng');
        applyFill(termSliderEl);
        calc();
    }

    function applyFill(slider) {
        if (!slider) return;
        const min = parseFloat(slider.min) || 0;
        const max = parseFloat(slider.max) || 100;
        const val = parseFloat(slider.value) || 0;
        const percentage = 100 * (val - min) / (max - min);
        slider.style.background = `linear-gradient(90deg, #00a651 ${percentage}%, #d7dcdf ${percentage + 0.1}%)`;
    }

     document.addEventListener("DOMContentLoaded", function() {
        // Toàn bộ danh sách xe của bạn
        const bikeModels = [
            "CB350 H'ness 2025", "ADV 350", "SH350i ASNV PB THỂ THAO", "SH350i ASNV PB ĐẶC BIỆT", "SH350i ANV PB CAO CẤP",
            "Super Cup 125cc Đặc biệt", "Super Cup 125cc Tiêu chuẩn", "CUV E", "ICON E PB THỂ THAO", "ICON E PB ĐẶC BIỆT",
            "ICON E PB CAO CẤP", "WINNER R TIÊU CHUẨN CBS 2026", "WINNER R ĐẶC BIỆT ABS 2026", "WINNER R THỂ THAO ABS 2026",
            "SH160 PHANH CBS PB TIÊU CHUẨN 2026", "SH160 PHANH ABS PB CAO CẤP 2026", "SH160 PHANH ABS PB ĐẶC BIỆT 2026", "SH160 PHANH ABS PB THỂ THAO 2026",
            "SH125 PHANH CBS PB TIÊU CHUẨN 2026", "SH125 PHANH ABS PB CAO CẤP 2026", "SH125 PHANH ABS PB ĐẶC BIỆT 2026", "SH125 PHANH ABS PB THỂ THAO 2026",
            "ALPHA TIÊU CHUẨN", "ALPHA ĐẶC BIỆT", "Alpha PB Cổ điển", "RSX PB Tiêu chuẩn 2026", "RSX PB Đặc biệt 2026", "RSX PB Thể thao 2026",
            "Future tiêu chuẩn 2026", "Future cao cấp 2026", "Future đặc biệt 2026", "VISION PB ĐẶC BIỆT", "VISION PB THỂ THAO",
            "VISION PB TIÊU CHUẨN 2026", "VISION PB CAO CẤP 2026", "VISION PB ĐẶC BIỆT 2026", "VISION PB THỂ THAO 2026",
            "LEAD 125 PB CAO CẤP CBS", "LEAD 125 PB TIÊU CHUẨN CBS 2026", "LEAD 125 PB CAO CẤP CBS 2026", "LEAD 125 PB ĐẶC BIỆT ABS 2026",
            "VARIO PB ĐẶC BIỆT 125 CBS", "VARIO PB THỂ THAO 125 CBS", "VARIO PB THỂ THAO 160 ABS", "AIR BLADE 125 CBS TIÊU CHUẨN 2026",
            "AB 125 CBS limited Marvel Venom", "AB 125 CBS limited Marvel Spider man", "AIR BLADE 125 CBS ĐẶC BIỆT 2026",
            "AIR BLADE 125 ABS THỂ THAO 2026", "AIR BLADE 160 ABS TIÊU CHUẨN 2026", "AIR BLADE 160 ABS ĐẶC BIỆT 2026",
            "AIR BLADE 160 ABS THỂ THAO 2026", "SH MODE tiêu chuẩn 125CBS", "SH MODE cao cấp 125ABS", "SH MODE đặc biệt 125ABS", "SH MODE Thể thao 125ABS"
        ];

        const searchInput = document.getElementById('moto-search-input-id');
        const dropdownList = document.getElementById('moto-search-dropdown-id');

        if (!searchInput || !dropdownList) return;

        // Hàm xuất danh sách xe
        function renderCustomDropdown(keyword = '') {
            dropdownList.innerHTML = ''; 
            
            const filteredBikes = bikeModels.filter(bike => 
                bike.toLowerCase().includes(keyword.toLowerCase().trim())
            );

            if (filteredBikes.length === 0) {
                const noResult = document.createElement('div');
                noResult.className = 'moto-search-none';
                noResult.textContent = 'Không tìm thấy dòng xe này';
                dropdownList.appendChild(noResult);
                return;
            }

            filteredBikes.forEach(model => {
                const item = document.createElement('div');
                item.className = 'moto-search-item';
                item.textContent = model;
                
                item.addEventListener('click', function() {
                    searchInput.value = model;            
                    dropdownList.classList.remove('moto-search-active'); 
                });
                
                dropdownList.appendChild(item);
            });
        }

        // Khởi tạo bảng chọn ban đầu
        renderCustomDropdown();

        // Sự kiện khi bấm vào ô nhập liệu
        searchInput.addEventListener('focus', function() {
            renderCustomDropdown(this.value);
            dropdownList.classList.add('moto-search-active');
        });

        // Sự kiện khi gõ phím tìm kiếm tìm xe
        searchInput.addEventListener('input', function() {
            renderCustomDropdown(this.value);
            dropdownList.classList.add('moto-search-active');
        });

        // Sự kiện bấm chuột ra ngoài để tự ẩn danh sách
        document.addEventListener('click', function(e) {
            if (!searchInput.contains(e.target) && !dropdownList.contains(e.target)) {
                dropdownList.classList.remove('moto-search-active');
            }
        });
    });


    // ============================================================
    // 5. HÀM LIÊN HỆ — EMAILJS (ĐÃ ĐỒNG BỘ CHUẨN KHÔNG LỆCH BIẾN)
    // ============================================================
    function initContactForm() {
        const btn = document.querySelector('.submit-btn');
        if (!btn) return;

        btn.addEventListener('click', async (e) => {
            if (e && e.preventDefault) e.preventDefault(); 

            if (typeof emailjs === 'undefined') {
                showToast('Hệ thống EmailJS chưa tải xong, vui lòng thử lại sau 2 giây!');
                return;
            }

            // Lấy dữ liệu từ 4 ô input trong step-card thứ 2 (Họ tên, SĐT, Loại xe, Email)
            // ── THAY THẾ ĐOẠN LẤY DỮ LIỆU CŨ THÀNH ĐOẠN NÀY ──
        // Tìm kiếm thông minh theo thuộc tính placeholder hoặc ID cụ thể để tránh lỗi thứ tự HTML
        const nameEl    = document.querySelector('input[placeholder*="tên"]') || document.getElementById('customer-name') || document.querySelectorAll('.cf-input')[0];
        const phoneEl   = document.querySelector('input[placeholder*="thoại"]') || document.getElementById('customer-phone') || document.querySelectorAll('.cf-input')[1];
        const vehicleEl = document.getElementById('moto-search-input-id') || document.querySelector('input[placeholder*="xe"]') || document.querySelectorAll('.cf-input')[2];
        const emailEl   = document.querySelector('input[placeholder*="email"]') || document.getElementById('customer-email') || document.querySelectorAll('.cf-input')[3];

        const name     = nameEl?.value.trim() || '';
        const phone    = phoneEl?.value.trim() || '';
        const vehicle  = vehicleEl?.value.trim() || '';
        const email    = emailEl?.value.trim() || '';

        const province = document.getElementById('province-select')?.value || '';
        const hourRaw  = document.getElementById('consult-hour')?.value   || '';
        const dayRaw   = document.getElementById('consult-day')?.value    || '';
        const monthRaw = document.getElementById('consult-month')?.value  || '';

        const hourValid   = hourRaw  !== 'Giờ' && hourRaw.trim()  !== '';
        const dayValid    = dayRaw   !== 'Ngày' && dayRaw.trim()  !== '';
        const monthValid  = monthRaw !== 'Tháng' && monthRaw.trim() !== '';
        const consultTime = (hourValid && dayValid && monthValid)
            ? `${hourRaw}:00 — Ngày ${dayRaw} tháng ${monthRaw}`
            : 'Không chọn';

        const loanSliderEl = getLoanSlider();
        const termSliderEl = getTermSlider();
        const resultBoxEl  = getResultBox();

        const realLoanValue = loanSliderEl ? (+loanSliderEl.value) : 20000000;
        const loanAmountStr = priceFormat(realLoanValue) + ' VNĐ';
        const loanTermStr   = (termSliderEl?.value || '12') + ' tháng';
        const monthlyPayStr = (resultBoxEl?.textContent || '—');

        // ── QUY TRÌNH KIỂM TRA LỖI NHẬP LIỆU (Cập nhật biến phần tử chuẩn xác) ──
        if (!name) {
            showError(nameEl, 'Vui lòng nhập Họ và tên'); return;
        }
        if (!phone || !/^0[3-9]\d{8}$/.test(phone.replace(/\s/g, ''))) {
            showError(phoneEl, 'Số điện thoại không hợp lệ (VD: 0901234567)'); return;
        }
        if (!vehicle) {
            showError(vehicleEl, 'Vui lòng chọn hoặc nhập loại xe'); return;
        }

            // Hiệu ứng Đang Gửi trên nút bấm
            const origHTML = btn.innerHTML;
            btn.innerHTML = `<span style="display:flex;align-items:center;justify-content:center;gap:8px">
                <svg style="animation:hv-spin .8s linear infinite;width:16px;height:16px;fill:none;stroke:#fff;stroke-width:2.5" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke-opacity=".3"/>
                    <path d="M12 2a10 10 0 0 1 10 10"/>
                </svg>
                ĐANG GỬI...
            </span>`;
            btn.disabled = true;

            try {
                emailjs.init(EMAILJS_PUBLIC_KEY);

                const result = await emailjs.send(
                    EMAILJS_SERVICE_ID,
                    EMAILJS_TEMPLATE_ID,
                    {
                        customer_name:  name,
                        customer_phone: phone,
                        customer_email: email || '(không cung cấp)',
                        vehicle_type:   vehicle,
                        province:       province || 'Không chọn',
                        consult_time:   consultTime,
                        loan_amount:    loanAmountStr,
                        loan_term:      loanTermStr,
                        monthly_pay:    monthlyPayStr,
                    },
                    { publicKey: EMAILJS_PUBLIC_KEY }
                );

                if (result && (result.status === 200 || result.text === 'OK')) {
                    showSuccess(btn.closest('.step-card-body'));
                } else {
                    throw new Error('Lỗi EmailJS Status: ' + result.status);
                }
            } catch (err) {
                console.error('EmailJS error:', err);
                btn.innerHTML = origHTML;
                btn.disabled  = false;
                showToast('Gửi thất bại. Vui lòng thử lại hoặc gọi: 0931 434 648');
            }
        });
    }

    // ── UI HELPERS ───────────────────────────────────────────────
function showError(inputEl, msg) {
    if (!inputEl) {
        showToast(msg); // Dự phòng nếu lỗi giao diện vẫn hiện được thông báo cho khách biết
        return;
    }
    inputEl.style.borderColor = '#EE0000';
    inputEl.focus();
    inputEl.parentElement.querySelector('.hv-err')?.remove();
    const err = document.createElement('span');
    err.className = 'hv-err';
    err.style.cssText = 'font-size:11px;color:#EE0000;margin-top:3px;display:block';
    err.textContent = msg;
    inputEl.after(err);
    inputEl.addEventListener('input', () => {
        inputEl.style.borderColor = '';
        err.remove();
    }, { once: true });
}

    function showToast(msg) {
        const t = document.createElement('div');
        t.style.cssText = `
            position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
            background:#EE0000;color:#fff;padding:12px 22px;border-radius:8px;
            font-size:13px;font-weight:600;z-index:9999;
            box-shadow:0 4px 16px rgba(0,0,0,.2);
            animation:hv-fadeup .25s ease;
        `;
        t.textContent = msg;
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 4000);
    }

    function showSuccess(container) {
        if (!container) return;
        container.innerHTML = `
            <div style="display:flex;flex-direction:column;align-items:center;padding:48px 20px;gap:14px;text-align:center;">
                <div style="width:68px;height:68px;background:#EDFAF4;border:2px solid #1A8A50;border-radius:50%;display:grid;place-items:center;">
                    <svg viewBox="0 0 24 24" style="width:30px;height:30px;stroke:#1A8A50;fill:none;stroke-width:2.5">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                </div>
                <h3 style="font-size:19px;font-weight:800;color:#1A8A50;margin:0;">Gửi yêu cầu thành công!</h3>
                <p style="font-size:13px;color:#666;max-width:280px;line-height:1.75;margin:0">
                    Chúng tôi đã nhận được thông tin của bạn và sẽ liên hệ lại trong thời gian sớm nhất.
                </p>
                <div style="margin-top:8px;padding:14px 20px;background:#f8f9fa;border:1px solid #ddd;border-radius:8px;font-size:13px;color:#333;">
                    Hoặc gọi ngay:<br>
                    <strong style="color:#EE0000;font-size:15px">0931 434 648</strong>
                    &nbsp;—&nbsp;
                    <strong style="color:#EE0000;font-size:15px">0901 264 949</strong>
                </div>
            </div>
        `;
    }

    const _style = document.createElement('style');
    _style.textContent = `
        @keyframes hv-spin   { to { transform:rotate(360deg) } }
        @keyframes hv-fadeup { from { opacity:0;transform:translateX(-50%) translateY(8px) } to { opacity:1;transform:translateX(-50%) translateY(0) } }
    `;
    document.head.appendChild(_style);


   
    // ============================================================
    // 6. KHỞI CHẠY HỆ THỐNG AN TOÀN TRÊN TRANG
    // ============================================================
    function initEverything() {
        const loanInputEl  = getLoanInput();
        const loanSliderEl = getLoanSlider();
        const termSliderEl = getTermSlider();
        const loanDispEl   = getLoanDisp();

        if (loanSliderEl) {
            loanSliderEl.setAttribute('min', '5000000');
            loanSliderEl.setAttribute('max', '100000000');
            loanSliderEl.setAttribute('step', '5000000');
            
            const defaultLoan = +loanSliderEl.value || 20000000;
            loanSliderEl.value = defaultLoan;
            if (loanInputEl) setContent(loanInputEl, priceFormat(defaultLoan));
            if (loanDispEl)  setContent(loanDispEl, priceFormat(defaultLoan) + ' VNĐ');

            loanSliderEl.addEventListener('input', onLoanSlide);
            applyFill(loanSliderEl);
        }

        if (termSliderEl) {
            termSliderEl.addEventListener('input', onTerm);
            applyFill(termSliderEl);
            const termDispEl = getTermDisp();
            if (termDispEl) setContent(termDispEl, termSliderEl.value + ' tháng');
        }

        if (loanInputEl) {
            loanInputEl.addEventListener('input',  onLoanInput);
            loanInputEl.addEventListener('change', onLoanChange);
        }

        calc();
        initContactForm();
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initEverything();
    } else {
        document.addEventListener('DOMContentLoaded', initEverything);
    }
