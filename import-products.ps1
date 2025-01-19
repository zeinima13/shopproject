$products = Get-Content -Path "products-import.json" -Raw
$headers = @{
    "Content-Type" = "application/json"
}
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/admin/import-products" -Method Post -Headers $headers -Body $products
Write-Host $response.Content
