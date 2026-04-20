import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const replaceInFile = (filePath, replacements) => {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Make sure useLanguage is imported if a file is missing it
  if (!content.includes('useLanguage')) {
    content = content.replace(/(import .* from '..\/api\/client';)/, "$1\nimport { useLanguage } from '../context/LanguageContext';");
  }
  if (!content.includes('const { t } = useLanguage()')) {
    content = content.replace(/(const \[products, setProducts\] = useState\(\[\]\);)/, "const { t } = useLanguage();\n  $1");
    content = content.replace(/(const \[messages, setMessages\] = useState\(\[\]\);)/, "const { t } = useLanguage();\n  $1");
  }

  replacements.forEach(([oldStr, newStr]) => {
    content = content.split(oldStr).join(newStr);
  });
  
  fs.writeFileSync(filePath, content);
  console.log(`Patched ${path.basename(filePath)}`);
};

// AdminProducts.jsx
replaceInFile(path.join(__dirname, 'client/src/pages/AdminProducts.jsx'), [
  ['Gestion des Produits', "{t('admin.products.title')}"],
  ['Espace administrateur CMS', "{t('admin.products.subtitle')}"],
  ['+ Ajouter un produit', "+ {t('admin.products.create')}"],
  ["{editId ? 'Modifier le produit' : 'Nouveau produit'}", "{editId ? t('admin.products.editTitle') : t('admin.products.newTitle')}"],
  [">Annuler<", ">{t('admin.products.cancel')}<"],
  ['1. Informations générales', "{t('admin.products.section1')}"],
  ['>Nom du Produit<', ">{t('admin.products.name')}<"],
  ['>Marque Associée<', ">{t('admin.products.brand')}<"],
  ['>Sélectionner...<', ">{t('admin.products.select')}<"],
  ['>Catégorie<', ">{t('admin.products.category')}<"],
  ['>Stock Actuel<', ">{t('admin.products.stock')}<"],
  ['>Prix (DZD)<', ">{t('admin.products.price')}<"],
  ['2. Visuel du Produit', "{t('admin.products.section2')}"],
  ['>Traitement...<', ">{t('admin.products.uploading')}<"],
  ['>Glisser ou cliquer<', ">{t('admin.products.uploadPrompt')}<"],
  ['Format JPG/PNG (Maximum : 5MB)', "{t('admin.products.uploadHint')}"],
  ["3. Emplacement d'Affichage (Tags)", "{t('admin.products.section3')}"],
  ["Sélectionnez les zones où vous souhaitez forcer l'affichage de ce produit :", "{t('admin.products.placementHint')}"],
  ['4. Description Typographique', "{t('admin.products.section4')}"],
  ['Détails techniques, capacités, notes marketing...', "{t('admin.products.descriptionHint')}"],
  ["{editId ? 'Sauvegarder les modifications' : 'Publier le produit'}", "{editId ? t('admin.products.save') : t('admin.products.publish')}"],
  ['🔍 Rechercher par nom de produit...', "{t('admin.products.search')}"],
  ['placeholder="🔍 Rechercher par nom de produit..."', 'placeholder={`🔍 ${t("admin.products.search")}`}'],
  ['placeholder="Détails techniques, capacités, notes marketing..."', 'placeholder={t("admin.products.descriptionHint")}'],
  ['>Toutes les marques<', ">{t('admin.products.allBrands')}<"],
  ['>Toutes les catégories<', ">{t('admin.products.allCategories')}<"],
  ['>Tous les emplacements<', ">{t('admin.products.allPlacements')}<"],
  ['>Produit<', ">{t('admin.products.tableProduct')}<"],
  ['>Marque<', ">{t('admin.products.tableBrand')}<"],
  ['>Catégorie<', ">{t('admin.products.tableCategory')}<"],
  ['>Emplacements<', ">{t('admin.products.tablePlacements')}<"],
  ['>Prix / Stock<', ">{t('admin.products.tablePriceStock')}<"],
  ['>Actions<', ">{t('admin.products.tableActions')}<"],
  ['>Rupture<', ">{t('admin.products.outOfStock')}<"],
  ['>Stock faible (', ">{t('admin.products.lowStock')} ("],
  ['>En stock (', ">{t('admin.products.inStock')} ("],
  ['>Mod.<', ">{t('admin.products.edit')}<"],
  ['>Suppr.<', ">{t('admin.products.delete')}<"],
  ['Aucun produit ne correspond à ces critères.', "{t('admin.products.empty')}"],
  ['"Êtes-vous sûr de vouloir supprimer ce produit ?"', "t('admin.products.confirmDelete')"],
  ['"Le fichier dépasse 5MB. Veuillez choisir une image plus petite."', "t('admin.products.fileTooLarge')"],
  [`"Erreur lors de l'upload de l'image"`, "t('admin.products.uploadError')"],
  [`"Erreur lors de l'enregistrement du produit"`, "t('admin.products.saveError')"],
  ["alert('Erreur de suppression')", "alert(t('admin.products.deleteError'))"]
]);

// AdminRequests.jsx
replaceInFile(path.join(__dirname, 'client/src/pages/AdminRequests.jsx'), [
  ["{stats.total} total requests", "{stats.total} {t('admin.requests.total')}"],
  [">Total<", ">{t('admin.requests.statTotal')}<"],
  [">Pending<", ">{t('admin.requests.statPending')}<"],
  [">Contacted<", ">{t('admin.requests.statContacted')}<"],
  [">Confirmed<", ">{t('admin.requests.statConfirmed')}<"],
  [">Cancelled<", ">{t('admin.requests.statCancelled')}<"],
  ['placeholder="Search by name, email, or phone..."', 'placeholder={t("admin.requests.search")}'],
  ['>All Status<', ">{t('admin.requests.allStatus')}<"],
  ['>All Types<', ">{t('admin.requests.allTypes')}<"],
  ['>Refresh<', ">{t('admin.requests.refresh')}<"],
  ['Cart Products (', "{t('admin.requests.cartProducts')} ("],
  ['>Total: ', ">{t('admin.requests.totalPrice')}: "],
  ['>Update Status<', ">{t('admin.requests.updateStatus')}<"],
  ['>View Details<', ">{t('admin.requests.viewDetails')}<"],
  ['No requests found', "{t('admin.requests.empty')}"],
  ["alert('Status update failed.')", "alert(t('admin.requests.statusUpdateFailed'))"],
  ["return 'Confirmed'", "return t('admin.status.confirmed')"],
  ["return 'Cancelled'", "return t('admin.status.cancelled')"]
]);

// AdminMessages.jsx
replaceInFile(path.join(__dirname, 'client/src/pages/AdminMessages.jsx'), [
  ['Message Center', "{t('admin.messages.title')}"],
  ['Manage contact form submissions', "{t('admin.messages.subtitle')}"],
  [">Total<", ">{t('admin.messages.statTotal')}<"],
  [">Unread<", ">{t('admin.messages.statUnread')}<"],
  [">Read<", ">{t('admin.messages.statRead')}<"],
  [">Archived<", ">{t('admin.messages.statArchived')}<"],
  ['Filter:', "{t('admin.messages.status')}:"],
  ['>All Messages<', ">{t('admin.messages.allStatus')}<"],
  ['>Refresh<', ">{t('admin.messages.refresh')}<"],
  ['>Mark Unread<', ">{t('admin.messages.markUnread')}<"],
  ['>Mark Read<', ">{t('admin.messages.markRead')}<"],
  ['>Archive<', ">{t('admin.messages.archive')}<"],
  ['>Delete<', ">{t('admin.products.delete')}<"],
  ['No messages found', "{t('admin.messages.empty')}"],
  ["alert('Status update failed.')", "alert(t('admin.messages.statusUpdateFailed'))"],
  ["alert('Delete failed.')", "alert(t('admin.products.deleteError'))"],
  ["'Delete this message?'", "t('admin.products.confirmDelete')"]
]);
