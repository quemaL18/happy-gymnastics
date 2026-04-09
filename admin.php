<?php
require 'init_db.php';

try {
    $db = getDB();

    $applications = $db->query("
        SELECT id, parent_name, phone, child_name, child_age, direction, comment, created_at
        FROM applications
        ORDER BY id DESC
    ")->fetchAll(PDO::FETCH_ASSOC);

    $payments = $db->query("
        SELECT id, child_fio, parent_fio, plan, amount, email, status, created_at
        FROM payments
        ORDER BY id DESC
    ")->fetchAll(PDO::FETCH_ASSOC);

} catch (Exception $e) {
    die('Ошибка подключения к базе: ' . htmlspecialchars($e->getMessage()));
}
?>
<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Админка — Счастливая гимнастика</title>
  <style>
    :root{
      --bg:#f7f3f6;
      --card:#ffffff;
      --line:#e7dfe5;
      --text:#2c2230;
      --muted:#7a6d78;
      --brand:#c88db6;
      --brand-dark:#b776a2;
      --ok:#eef8f1;
      --ok-line:#cfe8d6;
      --danger:#f7dfe5;
      --danger-dark:#d96c85;
      --danger-text:#7f2d3d;
    }

    *{box-sizing:border-box}

    body{
      margin:0;
      font-family: Arial, sans-serif;
      background: linear-gradient(180deg,#f5dce9 0%, #faf7f9 220px, #f7f3f6 100%);
      color:var(--text);
    }

    .wrap{
      max-width: 1280px;
      margin: 0 auto;
      padding: 24px;
    }

    .hero{
      background: rgba(255,255,255,.82);
      border:1px solid var(--line);
      border-radius:24px;
      padding:24px;
      box-shadow: 0 12px 30px rgba(44,34,48,.06);
      margin-bottom:20px;
    }

    .hero h1{
      margin:0 0 8px;
      font-size:32px;
    }

    .hero p{
      margin:0;
      color:var(--muted);
    }

    .stats{
      display:grid;
      grid-template-columns: repeat(4, 1fr);
      gap:14px;
      margin-top:18px;
    }

    .stat{
      background:var(--card);
      border:1px solid var(--line);
      border-radius:18px;
      padding:16px;
    }

    .stat small{
      display:block;
      color:var(--muted);
      margin-bottom:6px;
    }

    .stat strong{
      font-size:28px;
    }

    .section{
      margin-top:22px;
    }

    .sectionHead{
      display:flex;
      justify-content:space-between;
      align-items:center;
      gap:12px;
      margin-bottom:12px;
      flex-wrap:wrap;
    }

    .sectionHead h2{
      margin:0;
      font-size:24px;
    }

    .hint{
      color:var(--muted);
      font-size:14px;
    }

    .card{
      background:var(--card);
      border:1px solid var(--line);
      border-radius:22px;
      padding:16px;
      box-shadow: 0 12px 30px rgba(44,34,48,.05);
    }

    .tableWrap{
      overflow:auto;
      border:1px solid var(--line);
      border-radius:18px;
      background:#fff;
    }

    table{
      width:100%;
      border-collapse:collapse;
      min-width:1080px;
    }

    th, td{
      padding:12px 14px;
      text-align:left;
      border-bottom:1px solid #f0e8ee;
      vertical-align:top;
    }

    th{
      background:#faf5f8;
      color:var(--muted);
      font-weight:700;
      position:sticky;
      top:0;
      z-index:1;
    }

    tr:hover td{
      background:#fcf9fb;
    }

    .empty{
      padding:18px;
      border:1px dashed var(--line);
      border-radius:18px;
      color:var(--muted);
      background:#fff;
    }

    .badge{
      display:inline-flex;
      align-items:center;
      gap:8px;
      padding:6px 10px;
      border-radius:999px;
      border:1px solid var(--ok-line);
      background:var(--ok);
      font-size:13px;
      white-space:nowrap;
    }

    .topActions{
      display:flex;
      gap:10px;
      flex-wrap:wrap;
      margin-top:16px;
    }

    .btn{
      display:inline-flex;
      align-items:center;
      justify-content:center;
      padding:10px 14px;
      border-radius:14px;
      text-decoration:none;
      border:1px solid var(--line);
      background:#fff;
      color:var(--text);
      cursor:pointer;
      font-size:14px;
      line-height:1;
    }

    .btn--brand{
      background:var(--brand);
      border-color:var(--brand);
      color:#2b1f2e;
      font-weight:700;
    }

    .btn--brand:hover{
      background:var(--brand-dark);
      border-color:var(--brand-dark);
    }

    .btn--danger{
      background:#fff;
      border-color:#efc9d3;
      color:var(--danger-text);
      font-weight:700;
    }

    .btn--danger:hover{
      background:var(--danger);
      border-color:#e7a8b7;
    }

    .mono{
      font-family: Consolas, monospace;
      font-size:13px;
    }

    .actionsCell{
      white-space:nowrap;
      width:1%;
    }

    .deleteForm{
      margin:0;
    }

    @media (max-width: 900px){
      .stats{
        grid-template-columns: 1fr 1fr;
      }
    }

    @media (max-width: 600px){
      .wrap{
        padding:14px;
      }

      .hero h1{
        font-size:26px;
      }

      .stats{
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <section class="hero">
      <h1>Админка</h1>
      <p>Заявки и оплаты из базы сайта.</p>

      <div class="stats">
        <div class="stat">
          <small>Всего заявок</small>
          <strong><?= count($applications) ?></strong>
        </div>
        <div class="stat">
          <small>Всего оплат</small>
          <strong><?= count($payments) ?></strong>
        </div>
        <div class="stat">
          <small>Последняя заявка</small>
          <strong style="font-size:16px;">
            <?= !empty($applications) ? htmlspecialchars($applications[0]['created_at']) : '—' ?>
          </strong>
        </div>
        <div class="stat">
          <small>Последняя оплата</small>
          <strong style="font-size:16px;">
            <?= !empty($payments) ? htmlspecialchars($payments[0]['created_at']) : '—' ?>
          </strong>
        </div>
      </div>

      <div class="topActions">
        <a class="btn btn--brand" href="index.html">Открыть сайт</a>
        <a class="btn" href="pay.html">Страница оплаты</a>
        <a class="btn" href="contacts.html">Контакты</a>
      </div>
    </section>

    <section class="section">
      <div class="sectionHead">
        <h2>Заявки</h2>
        <div class="hint">Форма с главной, контактов и других страниц</div>
      </div>

      <?php if (empty($applications)): ?>
        <div class="empty">Заявок пока нет.</div>
      <?php else: ?>
        <div class="card">
          <div class="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Дата</th>
                  <th>Родитель</th>
                  <th>Телефон</th>
                  <th>Ребёнок</th>
                  <th>Возраст</th>
                  <th>Направление</th>
                  <th>Комментарий</th>
                  <th>Действие</th>
                </tr>
              </thead>
              <tbody>
                <?php foreach ($applications as $row): ?>
                  <tr>
                    <td class="mono"><?= htmlspecialchars($row['id']) ?></td>
                    <td><?= htmlspecialchars($row['created_at']) ?></td>
                    <td><?= htmlspecialchars($row['parent_name']) ?></td>
                    <td><?= htmlspecialchars($row['phone']) ?></td>
                    <td><?= htmlspecialchars($row['child_name']) ?></td>
                    <td><?= htmlspecialchars($row['child_age']) ?></td>
                    <td><?= htmlspecialchars($row['direction']) ?></td>
                    <td><?= htmlspecialchars($row['comment']) ?></td>
                    <td class="actionsCell">
                      <form class="deleteForm" method="post" action="delete.php" onsubmit="return confirm('Удалить эту заявку?');">
                        <input type="hidden" name="type" value="application">
                        <input type="hidden" name="id" value="<?= htmlspecialchars($row['id']) ?>">
                        <button class="btn btn--danger" type="submit">Удалить</button>
                      </form>
                    </td>
                  </tr>
                <?php endforeach; ?>
              </tbody>
            </table>
          </div>
        </div>
      <?php endif; ?>
    </section>

    <section class="section">
      <div class="sectionHead">
        <h2>Оплаты</h2>
        <div class="hint">Данные из формы оплаты</div>
      </div>

      <?php if (empty($payments)): ?>
        <div class="empty">Оплат пока нет.</div>
      <?php else: ?>
        <div class="card">
          <div class="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Дата</th>
                  <th>ФИО ребёнка</th>
                  <th>ФИО родителя</th>
                  <th>Абонемент</th>
                  <th>Сумма</th>
                  <th>E-mail</th>
                  <th>Статус</th>
                  <th>Действие</th>
                </tr>
              </thead>
              <tbody>
                <?php foreach ($payments as $row): ?>
                  <tr>
                    <td class="mono"><?= htmlspecialchars($row['id']) ?></td>
                    <td><?= htmlspecialchars($row['created_at']) ?></td>
                    <td><?= htmlspecialchars($row['child_fio']) ?></td>
                    <td><?= htmlspecialchars($row['parent_fio']) ?></td>
                    <td><?= htmlspecialchars($row['plan']) ?></td>
                    <td><?= htmlspecialchars($row['amount']) ?> ₽</td>
                    <td><?= htmlspecialchars($row['email']) ?></td>
                    <td><span class="badge"><?= htmlspecialchars($row['status']) ?></span></td>
                    <td class="actionsCell">
                      <form class="deleteForm" method="post" action="delete.php" onsubmit="return confirm('Удалить эту оплату?');">
                        <input type="hidden" name="type" value="payment">
                        <input type="hidden" name="id" value="<?= htmlspecialchars($row['id']) ?>">
                        <button class="btn btn--danger" type="submit">Удалить</button>
                      </form>
                    </td>
                  </tr>
                <?php endforeach; ?>
              </tbody>
            </table>
          </div>
        </div>
      <?php endif; ?>
    </section>
  </div>
</body>
</html>