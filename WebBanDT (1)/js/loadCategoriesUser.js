const API_PUBLIC = "http://localhost:8081/api/categories";

async function loadMenuCategoriesUser() {

    try {

        const res = await fetch(API_PUBLIC);
        const categories = await res.json();

        const menu = document.getElementById("categoryMenu");
        if (!menu) return;

        menu.innerHTML = "";

        // Lấy danh mục cha
        const parents = categories.filter(c => !c.parent);

        parents.forEach(parent => {

            let children = categories.filter(c => 
                c.parent && c.parent.id === parent.id
            );

            let childHtml = "";

            children.forEach(child => {

                childHtml += `
                    <a class="sub-category"
                       href="products.html?category=${child.id}">
                       ${child.name}
                    </a>
                `;

            });

            menu.insertAdjacentHTML("beforeend", `
                <div class="menu-item">

                    <a class="parent-category"
                       href="products.html?category=${parent.id}">
                       ${parent.name}
                    </a>

                    ${children.length ? `<div class="sub-menu">${childHtml}</div>` : ""}

                </div>
            `);

        });

    } catch (err) {

        console.error("Lỗi load menu category", err);

    }

}

loadMenuCategoriesUser();