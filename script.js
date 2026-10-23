document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobil Menü Yönetimi & Admin Üçlü Tıklama Kestirmesi
    const menuToggleBtn = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (menuToggleBtn && navMenu) {
        const menuIcon = menuToggleBtn.querySelector('i');

        menuToggleBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            if (menuIcon) {
                menuIcon.classList.toggle('fa-bars');
                menuIcon.classList.toggle('fa-xmark');
            }
        });

        let productClickCount = 0;
        let productClickTimer = null;

        document.querySelectorAll('#navMenu a').forEach(link => {
            const href = link.getAttribute('href');
            
            if (href === '#urun' || href === '#urunler') {
                // Ürün butonuna özel üçlü tıklama ve gecikmeli kapanma mantığı
                link.addEventListener('click', (e) => {
                    e.preventDefault(); // Anlık zıplamayı ve kapanmayı engelle
                    productClickCount++;

                    if (productClickCount === 1) {
                        productClickTimer = setTimeout(() => {
                            // 400ms içinde 3 kez tıklanmadıysa normal akışa dön (Menüyü kapat ve ürüne git)
                            productClickCount = 0;
                            navMenu.classList.remove('active');
                            if (menuIcon) {
                                menuIcon.classList.remove('fa-xmark');
                                menuIcon.classList.add('fa-bars');
                            }
                            window.location.hash = href;
                        }, 400);
                    }

                    if (productClickCount === 3) {
                        clearTimeout(productClickTimer);
                        productClickCount = 0;
                        window.location.href = "admin-login.html";
                    }
                });
            } else {
                // Diğer normal menü linkleri (Hikayemiz, Yorumlar vb.)
                link.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                    if (menuIcon) {
                        menuIcon.classList.remove('fa-xmark');
                        menuIcon.classList.add('fa-bars');
                    }
                });
            }
        });
    }

    // 2. Ürün Gramaj / Boyut Seçimi ve Dinamik Fiyat Yönetimi
    const weightButtons = document.querySelectorAll('.weight-btn');
    const priceDisplay = document.querySelector('.product-price');
    const productImage = document.getElementById('productImage');

    if (weightButtons.length > 0) {
        const activeBtnOnLoad = document.querySelector('.weight-btn.active');
        if (activeBtnOnLoad && priceDisplay) {
            const initialPrice = activeBtnOnLoad.getAttribute('data-price');
            const initialOriginal = activeBtnOnLoad.getAttribute('data-original');
            if (initialOriginal) {
                priceDisplay.innerHTML = `₺${Number(initialPrice).toLocaleString('tr-TR')},00 <span style="font-size: 1.1rem; color: var(--gray, #888); text-decoration: line-through; margin-left: 8px; font-weight: 500;">${initialOriginal}</span>`;
            }
        }

        weightButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                weightButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const selectedPrice = Number(btn.getAttribute('data-price'));
                const selectedImage = btn.getAttribute('data-image');
                const originalPriceText = btn.getAttribute('data-original');

                if (priceDisplay) {
                    if (originalPriceText) {
                        priceDisplay.innerHTML = `₺${selectedPrice.toLocaleString('tr-TR')},00 <span style="font-size: 1.1rem; color: var(--gray, #888); text-decoration: line-through; margin-left: 8px; font-weight: 500;">${originalPriceText}</span>`;
                    } else {
                        priceDisplay.textContent = '₺' + selectedPrice.toLocaleString('tr-TR') + ',00';
                    }
                }

                if (productImage && selectedImage) {
                    productImage.style.opacity = '0';
                    setTimeout(() => {
                        productImage.src = selectedImage;
                        productImage.style.opacity = '1';
                    }, 150);
                }
            });
        });
    }

    // 3. Adet Seçimi (+ / - Butonları)
    const qtyInput = document.getElementById('qtyInput');
    const qtyMinusBtn = document.getElementById('qtyMinusBtn');
    const qtyPlusBtn = document.getElementById('qtyPlusBtn');

    if (qtyMinusBtn && qtyInput) {
        qtyMinusBtn.addEventListener('click', () => {
            let val = parseInt(qtyInput.value) || 1;
            if (val > 1) qtyInput.value = val - 1;
        });
    }

    if (qtyPlusBtn && qtyInput) {
        qtyPlusBtn.addEventListener('click', () => {
            let val = parseInt(qtyInput.value) || 1;
            if (val < 50) qtyInput.value = val + 1;
        });
    }

    // 4. Sepete Ekleme ve LocalStorage Kaydı
    const addToCartBtn = document.querySelector('.buy-btn');
    const cartBadge = document.querySelector('.cart-badge');
    const toastNotification = document.getElementById('toastNotification');
    const toastMessage = document.getElementById('toastMessage');

    function showToast(message) {
        if (!toastNotification || !toastMessage) return;
        toastMessage.textContent = message;
        toastNotification.classList.add('show');
        setTimeout(() => {
            toastNotification.classList.remove('show');
        }, 3000);
    }

    function updateCartBadge() {
        if (!cartBadge) return;
        let cart = JSON.parse(localStorage.getItem('sahraCart')) || [];
        let totalCount = cart.reduce((sum, item) => sum + (item.quantity || item.qty || 1), 0);
        cartBadge.textContent = totalCount;
    }

    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            let cart = JSON.parse(localStorage.getItem('sahraCart')) || [];
            let quantity = qtyInput ? (parseInt(qtyInput.value) || 1) : 1;
            
            let activeWeightBtn = document.querySelector('.weight-btn.active');
            let activeImageEl = document.getElementById('productImage');

            let selectedWeight = activeWeightBtn ? activeWeightBtn.getAttribute('data-weight') : "250g";
            let selectedPrice = activeWeightBtn ? Number(activeWeightBtn.getAttribute('data-price')) : 600;
            let selectedImage = activeImageEl ? activeImageEl.getAttribute('src') : "fotoaa.jpg";
            
            let newItem = {
                name: "Sahra Geleneksel Harmanı",
                weight: selectedWeight,
                grind: "Standart",
                price: selectedPrice,
                image: selectedImage,
                quantity: quantity
            };

            let existingIndex = cart.findIndex(item => 
                item.name === newItem.name && 
                item.weight === newItem.weight
            );
            
            if (existingIndex > -1) {
                cart[existingIndex].quantity = (cart[existingIndex].quantity || cart[existingIndex].qty || 1) + quantity;
            } else {
                cart.push(newItem);
            }

            localStorage.setItem('sahraCart', JSON.stringify(cart));
            updateCartBadge();

            addToCartBtn.style.transform = 'scale(0.97)';
            setTimeout(() => { addToCartBtn.style.transform = 'scale(1)'; }, 150);

            showToast(`${quantity} adet (${selectedWeight}) sepete eklendi!`);
            if (qtyInput) qtyInput.value = 1;
        });
    }

    // 5. SSS Akordeon
    document.querySelectorAll('.faq-question').forEach(button => {
        button.addEventListener('click', () => {
            const parent = button.parentElement;
            const wasActive = parent.classList.contains('active');
            document.querySelectorAll('.faq-item').forEach(item => item.classList.remove('active'));
            if (!wasActive) parent.classList.add('active');
        });
    });

    // 6. Yasal Sözleşme Modalleri
    const legalPolicies = {
        mesafeli: { title: "Mesafeli Satış Sözleşmesi", body: "Bu sözleşme, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri uyarınca alıcı ile Sahra Kahvesi arasındaki satış koşullarını belirler." },
        iade: { title: "İptal ve İade Koşulları", body: "Gıda güvenliği ve hijyen standartları gereği ambalajı açılmış kahve ürünlerinde iade kabul edilmemektedir. Hasarlı kargolar için 14 gün içinde değişim hakkı vardır." },
        gizlilik: { title: "Gizlilik ve KVKK Politikası", body: "Kişisel verileriniz yalnızca sipariş teslimatı amacıyla 6698 sayılı KVKK kapsamında işler ve üçüncü taraflarla paylaşılmaz." },
        teslimat: { title: "Teslimat & Kargo Bilgileri", body: "Hafta içi saat 14:00'e kadar verilen siparişler aynı gün kargoya verilir. ₺1.000 üzeri siparişlerde kargo ücretsizdir." }
    };

    const modal = document.getElementById('legalModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalCloseBtn = document.getElementById('modalCloseBtn');

    document.querySelectorAll('.legal-trigger').forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.getAttribute('data-policy');
            if (legalPolicies[key] && modal && modalTitle && modalBody) {
                modalTitle.textContent = legalPolicies[key].title;
                modalBody.textContent = legalPolicies[key].body;
                modal.classList.add('open');
            }
        });
    });

    if (modal && modalCloseBtn) {
        modalCloseBtn.addEventListener('click', () => modal.classList.remove('open'));
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('open');
        });
    }

    updateCartBadge();
});

// 7. Yorum Formu Açma/Kapatma ve Kayıt Sistemi
document.addEventListener("DOMContentLoaded", () => {
    const toggleBtn = document.getElementById("toggleReviewForm");
    const reviewForm = document.getElementById("reviewForm");
    const reviewsContainer = document.getElementById("reviewsContainer");

    if (toggleBtn && reviewForm) {
        toggleBtn.addEventListener("click", () => {
            if (reviewForm.style.display === "none" || reviewForm.style.display === "") {
                reviewForm.style.display = "block";
                toggleBtn.textContent = "Formu Kapat";
            } else {
                reviewForm.style.display = "none";
                toggleBtn.textContent = "Siz De Deneyiminizi Paylaşın";
            }
        });
    }

    const savedReviews = JSON.parse(localStorage.getItem("sahra_reviews")) || [];
    savedReviews.forEach(rev => {
        if (rev.status !== "Gizli") {
            createReviewCard(rev.name, rev.comment || rev.text, rev.rating, false);
        }
    });

    if (reviewForm) {
        reviewForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const name = document.getElementById("revName").value;
            const email = document.getElementById("revEmail").value;
            const rating = parseInt(document.getElementById("revRating").value);
            const text = document.getElementById("revText").value;

            const newReview = { 
                name: name, 
                email: email, 
                rating: rating, 
                comment: text, 
                status: "Yayında" 
            };
            
            savedReviews.unshift(newReview);
            localStorage.setItem("sahra_reviews", JSON.stringify(savedReviews));

            createReviewCard(name, text, rating, true);

            reviewForm.reset();
            reviewForm.style.display = "none";
            if (toggleBtn) toggleBtn.textContent = "Siz De Deneyiminizi Paylaşın";
            alert("Yorumunuz için teşekkür ederiz!");
        });
    }
    
    function createReviewCard(name, text, rating, prepend = true) {
        let starsHtml = "";
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                starsHtml += '<i class="fa-solid fa-star"></i>';
            } else {
                starsHtml += '<i class="fa-regular fa-star"></i>';
            }
        }

        const card = document.createElement("div");
        card.className = "review-card";

        card.innerHTML = `
            <div>
                <div class="stars">${starsHtml}</div>
                <p class="review-text">"${text}"</p>
            </div>
            <div class="reviewer"><i class="fa-solid fa-circle-user"></i> ${name}</div>
        `;

        if (reviewsContainer) {
            if (prepend) {
                reviewsContainer.prepend(card);
            } else {
                reviewsContainer.appendChild(card);
            }
        }
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const adminTrigger = document.getElementById('adminTrigger');
    if (!adminTrigger) return;

    let clickCount = 0;
    let clickTimer = null;

    adminTrigger.addEventListener('click', (e) => {
        e.preventDefault(); // Sayfanın en başına zıplamasını veya yenilenmesini engelle
        clickCount++;

        if (clickCount === 1) {
            clickTimer = setTimeout(() => {
                clickCount = 0; // 400 milisaniye içinde 3 kez basılmazsa sayacı sıfırla
            }, 800);
        }

        if (clickCount === 3) {
            clearTimeout(clickTimer);
            clickCount = 0;
            window.location.href = "admin-login.html"; // Admin giriş sayfasına yönlendir
        }
    });
});
