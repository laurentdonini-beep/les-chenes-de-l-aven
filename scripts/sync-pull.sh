#!/usr/bin/env bash
# Récupère les mises à jour du dépôt GitHub sans jamais écraser le travail local.
# --ff-only : si des modifications locales existent, le pull est refusé proprement.
cd "$(dirname "$0")/.." || exit 1
git fetch origin || exit 1
git pull --ff-only origin main
