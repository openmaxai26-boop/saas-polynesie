#!/bin/bash
# ============================================================
# SCRIPT DE DÉPLOIEMENT — SaaS Polynésie
# Exécuter depuis le dossier saas-polynesie/
# ============================================================

set -e  # Stop si erreur

echo "🚀 Déploiement SaaS Polynésie..."
echo ""

# Vérifier que les outils sont installés
command -v git >/dev/null || { echo "❌ git non installé"; exit 1; }
command -v node >/dev/null || { echo "❌ node non installé"; exit 1; }

# ---- ÉTAPE 1 : Push GitHub ----
echo "📦 Étape 1/3 — Push sur GitHub..."

# Remplacer par votre username GitHub
GITHUB_USER="VOTRE_USERNAME_GITHUB"
REPO_NAME="saas-polynesie"

git init 2>/dev/null || true
git add .
git commit -m "Deploy: SaaS Polynésie v1.0" 2>/dev/null || echo "Rien à committer"
git branch -M main 2>/dev/null || true

echo ""
echo "👉 Créez d'abord le repo GitHub manuellement:"
echo "   https://github.com/new → Nom: $REPO_NAME → Create"
echo ""
read -p "Appuyez sur Entrée une fois le repo créé..."

git remote remove origin 2>/dev/null || true
git remote add origin "https://github.com/$GITHUB_USER/$REPO_NAME.git"
git push -u origin main

echo "✅ Code pushé sur GitHub"
echo ""

# ---- ÉTAPE 2 : Vercel ----
echo "⚡ Étape 2/3 — Déploiement Vercel..."

# Installer Vercel CLI si nécessaire
if ! command -v vercel &> /dev/null; then
  npm install -g vercel
fi

vercel --yes

echo ""
echo "✅ Déploiement Vercel terminé !"
echo ""

# ---- ÉTAPE 3 : Variables d'environnement ----
echo "🔑 Étape 3/3 — Variables d'environnement"
echo ""
echo "Allez sur https://vercel.com/dashboard → votre projet → Settings → Environment Variables"
echo ""
echo "Ajoutez ces variables (copiez depuis .env.example et remplissez les valeurs) :"
echo ""
grep -v "^#" .env.example | grep "=" | while read line; do
  KEY=$(echo "$line" | cut -d= -f1)
  echo "  → $KEY"
done

echo ""
echo "🎉 DÉPLOIEMENT TERMINÉ !"
echo ""
echo "Prochaines étapes :"
echo "  1. Ajouter les variables d'env sur Vercel"
echo "  2. Ouvrir https://VOTRE-PROJET.vercel.app"
echo "  3. Lancer le premier scraping depuis le dashboard"
echo "  4. Approuver les premiers emails dans Validations"
echo ""
