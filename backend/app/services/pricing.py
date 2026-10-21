from decimal import Decimal, ROUND_HALF_UP
from typing import Any


def money(value: float | Decimal | str) -> Decimal:
    return Decimal(str(value)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def effective_unit_price(product: dict[str, Any]) -> Decimal:
    price = money(product["price"])
    discount = money(product.get("discount_percent") or 0)
    if discount <= 0:
        return price
    return money(price * (Decimal("100") - discount) / Decimal("100"))


def validate_order_items(
    items: list[dict[str, Any]], products_by_id: dict[str, dict[str, Any]]
) -> tuple[list[dict[str, Any]], Decimal, list[str]]:
    errors: list[str] = []
    validated: list[dict[str, Any]] = []
    total = Decimal("0")

    if not items:
        errors.append("Cart is empty")
        return validated, total, errors

    for idx, item in enumerate(items):
        product_id = item.get("product_id")
        quantity = item.get("quantity")

        if not product_id or not isinstance(quantity, int) or quantity < 1:
            errors.append(f"Invalid line item at index {idx}")
            continue

        product = products_by_id.get(product_id)
        if not product:
            errors.append(f"Product not found: {product_id}")
            continue

        if not product.get("is_active", True):
            errors.append(f"Product unavailable: {product.get('name')}")
            continue

        stock = int(product.get("stock") or 0)
        if quantity > stock:
            errors.append(
                f"Insufficient stock for {product.get('name')} (available: {stock})"
            )
            continue

        unit = effective_unit_price(product)
        line_total = money(unit * quantity)
        total += line_total
        validated.append(
            {
                "product_id": product_id,
                "product_name": product["name"],
                "unit_price": float(unit),
                "quantity": quantity,
                "line_total": float(line_total),
            }
        )

    if errors:
        return [], Decimal("0"), errors

    return validated, money(total), []
