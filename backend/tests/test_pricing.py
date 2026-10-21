from app.services.pricing import effective_unit_price, validate_order_items


def test_effective_unit_price_discount():
    product = {"price": 100, "discount_percent": 10}
    assert float(effective_unit_price(product)) == 90.0


def test_validate_order_items_stock():
    products = {
        "p1": {
            "id": "p1",
            "name": "Sparkler",
            "price": 100,
            "discount_percent": 0,
            "stock": 2,
            "is_active": True,
        }
    }
    items = [{"product_id": "p1", "quantity": 5}]
    _, _, errors = validate_order_items(items, products)
    assert any("Insufficient stock" in e for e in errors)
