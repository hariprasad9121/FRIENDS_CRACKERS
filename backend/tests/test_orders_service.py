"""Order service expects Supabase RPC create_order_atomic (see supabase migrations)."""

from unittest.mock import MagicMock, patch

from app.services import orders as orders_module


def test_create_order_success_parses_rpc_response():
    mock_sb = MagicMock()
    mock_sb.rpc.return_value.execute.return_value.data = {
        "ok": True,
        "order_id": "order-uuid-1",
    }
    mock_sb.table.return_value.select.return_value.eq.return_value.maybe_single.return_value.execute.return_value.data = {
        "id": "order-uuid-1",
        "total_amount": 198,
    }
    mock_sb.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [
        {"product_name": "Demo", "quantity": 2}
    ]

    with patch.object(orders_module, "get_supabase", return_value=mock_sb):
        order, errors = orders_module.create_order(
            "user-1",
            [{"product_id": "p1", "quantity": 2}],
            {
                "shipping_name": "Test",
                "shipping_phone": "9999999999",
                "shipping_address": "123 St",
                "shipping_city": "Chennai",
                "shipping_pincode": "600001",
            },
        )

    assert errors == []
    assert order is not None
    assert order["id"] == "order-uuid-1"
    mock_sb.rpc.assert_called_once()
    assert mock_sb.rpc.call_args[0][0] == "create_order_atomic"


def test_create_order_rpc_validation_errors():
    mock_sb = MagicMock()
    mock_sb.rpc.return_value.execute.return_value.data = {
        "ok": False,
        "errors": ["Insufficient stock for Demo (available: 1)"],
    }

    with patch.object(orders_module, "get_supabase", return_value=mock_sb):
        order, errors = orders_module.create_order(
            "user-1",
            [{"product_id": "p1", "quantity": 2}],
            {
                "shipping_name": "Test",
                "shipping_phone": "9999999999",
                "shipping_address": "123 St",
                "shipping_city": "Chennai",
                "shipping_pincode": "600001",
            },
        )

    assert order is None
    assert "Insufficient stock" in errors[0]
